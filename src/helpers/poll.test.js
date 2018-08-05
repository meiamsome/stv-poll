import { runPoll } from './poll.js'

describe('runPoll', () => {
  it('matches Wikipedia example', () => {
    // From Wikipedia
    // https://en.wikipedia.org/wiki/Single_transferable_vote#Example
    const optionCount = 5
    const winnerCount = 3
    const ballots = [
      [0],
      [0],
      [0],
      [0],
      [1, 0],
      [1, 0],
      [2, 3],
      [2, 3],
      [2, 3],
      [2, 3],
      [2, 3],
      [2, 3],
      [2, 3],
      [2, 3],
      [2, 4],
      [2, 4],
      [2, 4],
      [2, 4],
      [3],
      [4],
    ]

    const results = runPoll(optionCount, winnerCount, ballots)
    expect(results).toHaveLength(6)

    const [
      stage0,
      stage1,
      stage2,
      stage3,
      stage4,
      stage5,
    ] = results
    expect(stage0).toHaveProperty('winners', [])
    expect(stage0).toHaveProperty('losers', [])

    expect(stage1).toHaveProperty('winners', [2])
    expect(stage1).toHaveProperty('losers', [])

    expect(stage2).toHaveProperty('winners', [2])
    expect(stage2).toHaveProperty('losers', [1])

    expect(stage3).toHaveProperty('winners', [2, 0])
    expect(stage3).toHaveProperty('losers', [1])

    expect(stage4).toHaveProperty('winners', [2, 0])
    expect(stage4).toHaveProperty('losers', [1, 4])

    expect(stage5).toHaveProperty('winners', [2, 0, 3])
    expect(stage5).toHaveProperty('losers', [1, 4])
  })

  it('allows an option having no initial votes', () => {
    const optionCount = 4
    const winnerCount = 1
    const ballots = [
      [0],
      [0],
      [1],
      [2],
    ]

    const results = runPoll(optionCount, winnerCount, ballots)
    expect(results).toHaveLength(4)

    const [
      stage0,
      stage1,
      stage2,
      stage3,
    ] = results
    expect(stage0).toHaveProperty('winners', [])
    expect(stage0).toHaveProperty('losers', [])

    expect(stage1).toHaveProperty('winners', [])
    expect(stage1).toHaveProperty('losers', [3])

    expect(stage2).toHaveProperty('winners', [])
    expect(stage2).toHaveProperty('losers', [3, 1, 2])

    expect(stage3).toHaveProperty('winners', [0])
    expect(stage3).toHaveProperty('losers', [3, 1, 2])
  })

  it('ignores subsequent choices that have been eliminated', () => {
    const optionCount = 4
    const winnerCount = 1
    // Elimination should be 0, 1 such that the first ballot goes from 1 -> 2
    // rather than from 1 -> 0
    const ballots = [
      [1, 0, 2],
      [0],
      [1, 0],
      [2],
      [2],
      [2],
      [3],
      [3],
      [3],
    ]

    const results = runPoll(optionCount, winnerCount, ballots)
    expect(results).toHaveLength(5)

    const [
      stage0,
      stage1,
      stage2,
      stage3,
      stage4,
    ] = results
    expect(stage0).toHaveProperty('winners', [])
    expect(stage0).toHaveProperty('losers', [])

    expect(stage1).toHaveProperty('winners', [])
    expect(stage1).toHaveProperty('losers', [0])

    expect(stage2).toHaveProperty('winners', [])
    expect(stage2).toHaveProperty('losers', [0, 1])

    expect(stage3).toHaveProperty('winners', [])
    expect(stage3).toHaveProperty('losers', [0, 1, 3])

    expect(stage4).toHaveProperty('winners', [2])
    expect(stage4).toHaveProperty('losers', [0, 1, 3])
  })
})
