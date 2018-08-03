export function actionMapReducer (initialState, actionMapHandlers) {
  return (state = initialState, action) => actionMapHandlers[action.type]?.(state, action) || state
}
