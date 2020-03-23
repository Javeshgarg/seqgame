import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import data from './game'

export default combineReducers({
  routing,
  data
})