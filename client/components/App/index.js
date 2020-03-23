import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions'
import style from './style.css'

class App extends Component {
  render() {
    const { children, ...others } = this.props;
    return (
      <div className={style.normal}>
        {React.cloneElement(children, {...others})}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    ...state.data
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)