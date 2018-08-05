import firebase from 'firebase/app'
import '@firebase/database'
import ReduxSagaFirebase from 'redux-saga-firebase'
import { fork } from 'redux-saga/effects'

import { syncPolls } from '../actions/polls'

const myFirebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyAfOk2ZO0JvoEZsMnnAbZs9QtF1RFOGTxM',
  authDomain: 'stvpoll-ed816.firebaseapp.com',
  databaseURL: 'https://stvpoll-ed816.firebaseio.com',
  projectId: 'stvpoll-ed816',
})

const reduxSagaFirebase = new ReduxSagaFirebase(myFirebaseApp)

function * rootSaga () {
  yield fork(reduxSagaFirebase.database.sync, 'polls', {
    successActionCreator: syncPolls,
  })
}

export default rootSaga
