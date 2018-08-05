import { actionMapReducer } from './utils'

const INITIAL_STATE = {
  7: {
    ballots: {
      aUser: [
        0,
        1,
        3,
      ],
      bUser: [
        0,
        3,
        1,
      ],
      cUser: [
        2,
      ],
    },
    options: [
      'Test Candidate A',
      'Test Candidate B',
      'Test Candidate C',
      'Test Candidate D',
    ],
    title: 'This is a test',
    winnerCount: 2,
  },
}

const reducer = actionMapReducer(INITIAL_STATE, {

})

export default reducer
