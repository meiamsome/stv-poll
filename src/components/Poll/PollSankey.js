import { Sankey } from '@nivo/sankey'
import React, { Component } from 'react'

class PollSankey extends Component {
  render () {
    const {
      options,
      stages,
    } = this.props

    const nodes = []
    for (const [stageId, stage] of stages.entries()) {
      for (const winnerId of stage.winners) {
        nodes.push({
          id: `${stageId}-${winnerId}`,
          name: options[winnerId],
          winner: true,
        })
      }
      // Disabled because the optional-chaining transform is interfering with this rule
      /* eslint-disable no-restricted-globals */
      const activeNodes = [...stage.contenders.entries()]
        .filter(([k, _]) => !stage.winners.includes(k))
        .filter(([_, arr]) => arr?.length)
        .map(([k, arr]) => [k, arr.map(({ weighting }) => weighting).reduce((a, b) => a + b, 0)])
        .sort(([aK, aV], [bK, bV]) => bV - aV)
      /* eslint-enable no-restricted-globals */
      for (const [contenderId] of activeNodes) {
        nodes.push({
          id: `${stageId}-${contenderId}`,
          name: options[contenderId],
        })
      }

      if (stage.discardedBallots.length > 0) {
        nodes.push({
          id: `${stageId}-discard`,
          name: 'Discarded ballots',
        })
      }
    }

    const linkMap = {}
    for (const [stageId, stage] of stages.entries()) {
      for (const [contenderId, contenderVotes] of Object.entries(stage.contenders).filter(([k, v]) => v)) {
        for (const { from, weighting } of contenderVotes) {
          if (from !== undefined) {
            const source = `${stageId - 1}-${from}`
            const target = `${stageId}-${contenderId}`
            linkMap[source] = linkMap[source] || {}
            linkMap[source][target] = linkMap[source][target] || 0
            linkMap[source][target] += weighting
          }
        }
      }
      for (const winnerId of stage.winners) {
        const source = `${stageId - 1}-${winnerId}`
        const target = `${stageId}-${winnerId}`
        linkMap[source] = linkMap[source] || {}
        linkMap[source][target] = linkMap[source][target] || 0
        linkMap[source][target] += stage.winningBallots[winnerId].map(({ weighting }) => weighting).reduce((a, b) => a + b, 0)
      }

      if (stage.discardedBallots.length > 0) {
        for (const { from, weighting } of stage.discardedBallots) {
          if (from !== undefined) {
            const source = `${stageId - 1}-${from}`
            const target = `${stageId}-discard`
            linkMap[source] = linkMap[source] || {}
            linkMap[source][target] = linkMap[source][target] || 0
            linkMap[source][target] += weighting
          }
        }
      }
    }

    const links = []
    for (const [source, targets] of Object.entries(linkMap)) {
      for (const [target, value] of Object.entries(targets)) {
        links.push({
          source,
          target,
          value,
        })
      }
    }

    return (
      <Sankey
        align='left'
        data={{
          links,
          nodes,
        }}
        label={node => {
          if (node.winner) {
            return `${node.name} (Winner)`
          } else if (node.loser) {
            return `${node.name} (Loser)`
          } else {
            return node.name
          }
        }}
        width={1200}
        height={600}
      />
    )
  }
}

export default PollSankey
