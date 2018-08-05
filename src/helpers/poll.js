export function runPoll (optionCount, winnerCount, ballots) {
  const droopLimit = Math.floor(ballots.length / (winnerCount + 1)) + 1
  const stages = []
  const copiedBallots = [...Object.entries(ballots).map(([key, ballot]) => ({
    choices: ballot,
    key,
    weighting: 1,
  }))]

  let stage = {
    contenders: Array.from({ length: optionCount }, () => []),
    discardedBallots: 0,
    discardedBallotsFromWinning: 0,
    losers: [],
    winners: [],
  }

  for (const ballot of copiedBallots) {
    if (ballot.choices.length) {
      const choice = ballot.choices.shift()
      stage.contenders[choice].push(ballot)
    } else {
      stage.discardedBallots += 1
    }
  }
  stages.push(stage)

  while (stage.winners.length < winnerCount && stage.contenders.some(arr => arr)) {
    stage = {
      ...stage,
      // Disabled because the optional-chaining transform is interfering with this rule
      // eslint-disable-next-line no-loop-func
      contenders: stage.contenders.map(arr => arr?.slice() || null),
      losers: stage.losers.slice(),
      winners: stage.winners.slice(),
    }

    let winners = [...stage.contenders.entries()]
      .filter(([k, v]) => v !== null)
      .filter(([k, v]) => v.map(({ weighting }) => weighting).reduce((a, b) => a + b, 0) >= droopLimit)

    if (winners.length === 0) {
      // Disabled because the optional-chaining transform is interfering with this rule
      // eslint-disable-next-line no-restricted-globals
      if (stage.winners.length + stage.contenders.filter(v => v?.length > 0).length <= winnerCount) {
        // Winners by elimination
        winners = [...stage.contenders.entries()].filter(([k, v]) => v !== null)
      }
    }

    if (winners.length) {
      // Only take the current most-voted winner. Due to the way winning
      // ballots get redistributed, this choice can affect the result.
      // TODO: Verify this is a good choice
      const [winnerId, votes] = winners.sort(([aK, aV], [bK, bV]) => bV.length - aV.length)[0]
      const surplus = votes.length - droopLimit
      if (surplus) {
        // Redistribute the 'surplus' of each individual ballot
        for (const { choices, weighting, ...ballot } of votes) {
          if (choices.length) {
            const choice = choices.shift()
            stage.contenders[choice].push({
              ...ballot,
              choices,
              weighting: weighting * surplus / votes.length,
            })
          } else {
            stage.discardedBallotsFromWinning += weighting
          }
        }
      }
      stage.winners.push(winnerId)
      stage.contenders[winnerId] = null
    } else {
      // Runoff the losers

      const sortedContenders = [...stage.contenders.entries()]
        .filter(([k, v]) => v !== null)
        .sort(([aK, aV], [bK, bV]) => aV.length - bV.length)

      const loserLength = sortedContenders[0][1].length

      const losers = sortedContenders.filter(([_, x]) => x.length === loserLength)
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
            stage.contenders[choice].push(ballot)
          } else {
            stage.discardedBallots += ballot.weighting
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
