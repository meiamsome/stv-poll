export function createAction (actionType) {
  const ret = (payload, meta) => ({
    error: payload instanceof Error,
    meta,
    payload,
    type: actionType,
  })
  ret.type = actionType
  return ret
}

export function createAsyncAction (actionType) {
  const request = createAction(`${actionType}_REQUEST`)
  const result = createAction(`${actionType}_RESULT`)
  request.request = request
  request.result = result
  return request
}
