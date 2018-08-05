import { actionMapReducer } from './utils'
import { syncPolls } from '../actions/polls'

const INITIAL_STATE = {}

const reducer = actionMapReducer(INITIAL_STATE, {
  [syncPolls.type]: (state, action) => action.payload,
})

export default reducer
