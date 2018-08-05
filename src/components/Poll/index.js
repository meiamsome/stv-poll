import React, { Component } from 'react'
import { connect } from 'react-redux'

import { runPoll } from '../../helpers/poll'

import PollSankey from './PollSankey'

class Poll extends Component {
  render () {
    const {
      poll,
    } = this.props
    if (!poll) {
      return (
        <div>
          No such poll.
        </div>
      )
    }

    // Calculate valid ballots (Not sure it's easy to enforce by rules in firebase)
    const ballots = {}
    for (const [k, v] of Object.entries(poll.ballots)) {
      let ok = true
      for (const id of v) {
        if (!(id in poll.options)) {
          ok = false
          break
        }
      }
      if (ok) {
        ballots[k] = v
      }
    }

    const stages = runPoll(poll.options.length, poll.winnerCount, ballots)

    return (
      <div>
        {poll.title} (Total ballots {Object.entries(poll.ballots).length}, invalid {Object.entries(poll.ballots).length - Object.entries(ballots).length})
        <PollSankey options={poll.options} stages={stages} />
      </div>
    )
  }
}

export default connect((state, ownProps) => ({
  poll: state.polls[ownProps.match.params.id],
}))(Poll)
