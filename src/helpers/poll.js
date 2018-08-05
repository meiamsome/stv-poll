export function runPoll (optionCount, winnerCount, ballots) {
  const stages = []
  const copiedBallots = Object.entries(ballots).map(([key, ballot]) => ({
    choices: ballot.slice(),
    key,
    weighting: 1,
  }))
  const droopLimit = Math.floor(copiedBallots.length / (winnerCount + 1)) + 1

  let stage = {
    contenders: Array.from({ length: optionCount }, () => []),
    discardedBallots: [],
    losers: [],
    winners: [],
    winningBallots: Array.from({ length: optionCount }, () => null),
  }

  for (const ballot of copiedBallots) {
    if (ballot.choices.length) {
      const choice = ballot.choices.shift()
      stage.contenders[choice].push(ballot)
    } else {
      stage.discardedBallots.push(ballot)
    }
  }
  stages.push(stage)

  while (stage.winners.length < winnerCount && stage.contenders.some(arr => arr)) {
    stage = {
      ...stage,
      // Disabled because the optional-chaining transform is interfering with this rule
      // eslint-disable-next-line no-loop-func
      contenders: [...stage.contenders.entries()].map(([key, arr]) => arr?.slice()?.map(ballot => ({
        ...ballot,
        from: key,
      })) || null),
      discardedBallots: stage.discardedBallots.map(ballot => ({
        ...ballot,
        from: 'discard',
      })),
      losers: stage.losers.slice(),
      winners: stage.winners.slice(),
      winningBallots: stage.winningBallots.slice(),
    }

    const contenderScores = [...stage.contenders.entries()]
      .filter(([k, v]) => v !== null)
      .map(([k, v]) => [k, v, v.map(({ weighting }) => weighting).reduce((a, b) => a + b, 0)])

    let winners = contenderScores.filter(([k, v, score]) => score >= droopLimit)

    if (winners.length === 0) {
      // Disabled because the optional-chaining transform is interfering with this rule
      // eslint-disable-next-line no-restricted-globals
      if (stage.winners.length + stage.contenders.filter(v => v?.length > 0).length <= winnerCount) {
        // Winners by elimination
        winners = [...stage.contenders.entries()]
          .filter(([k, v]) => v !== null)
          .map(([k, v]) => [k, v, v.map(({ weighting }) => weighting).reduce((a, b) => a + b, 0)])
      }
    }

    if (winners.length) {
      // Only take the current most-voted winner. Due to the way winning
      // ballots get redistributed, this choice can affect the result.
      // TODO: Verify this is a good choice
      const [winnerId, votes, score] = winners.sort(([aK, aV, aScore], [bK, bV, bScore]) => bScore - aScore)[0]
      stage.contenders[winnerId] = null
      const surplus = score - droopLimit
      if (surplus > 0) {
        // Redistribute the 'surplus' of each individual ballot
        for (const { choices, weighting, ...ballot } of votes) {
          let choice
          let choiceValid = false

          while (!choiceValid && choices.length) {
            choice = choices.shift()
            choiceValid = stage.contenders[choice]
          }

          if (choiceValid) {
            stage.contenders[choice].push({
              ...ballot,
              choices,
              from: winnerId,
              weighting: weighting * surplus / score,
            })
          } else {
            stage.discardedBallots.push({
              ...ballot,
              choices,
              from: winnerId,
              weighting: weighting * surplus / score,
            })
          }
        }
      }
      const winningBallots = []
      for (const { choices, weighting, ...ballot } of votes) {
        winningBallots.push({
          ...ballot,
          from: winnerId,
          weighting: weighting * Math.min(1, 1 - surplus / score),
        })
      }
      stage.winningBallots[winnerId] = winningBallots
      stage.winners.push(winnerId)
    } else {
      // Runoff the losers

      const sortedContenders = contenderScores.sort(([aK, aV, aScore], [bK, bV, bScore]) => aScore - bScore)

      const loserScore = sortedContenders[0][2]

      const losers = sortedContenders.filter(([k, v, x]) => x === loserScore)
      const loserIds = losers.map(([k, v]) => k)
      // We can handle multiple losers because ballot weights don't get adjusted
      for (const [loserId, loser] of losers) {
        stage.losers.push(loserId)
        for (const ballot of loser) {
          let choice
          let choiceValid = false

          while (!choiceValid && ballot.choices.length) {
            choice = ballot.choices.shift()
            choiceValid = stage.contenders[choice] && !loserIds.includes(choice)
          }

          if (choiceValid) {
            stage.contenders[choice].push({
              ...ballot,
              from: loserId,
            })
          } else {
            stage.discardedBallots.push({
              ...ballot,
              from: loserId,
            })
          }
        }
        stage.contenders[loserId] = null
      }
    }

    stages.push(stage)
    // At least one winner or loser per loop, and one stage prior to loop
    if (stages.length > stage.contenders.length + 1) {
      throw new Error('Exceeded expected length of run')
    }
  }

  return stages
}
