import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'

export default function configure(initialState) {
  const create = window.devToolsExtension
    ? window.devToolsExtension()(createStore)
    : createStore

const logger = store => next => action  => {
  console.log(action)
  return next(action)
}
  const createStoreWithMiddleware = applyMiddleware(
    logger
  )(create);

  const store = createStoreWithMiddleware(rootReducer, initialState)

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers')
      store.replaceReducer(nextReducer)
    })
  }

  return store
}