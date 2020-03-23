import React, { Component } from 'react'
import style from './style.css'

export default class Game extends Component {
	
  componentDidMount() {
		!this.props.id && this.props.actions.fetchId();
    this.props.actions.fetchGame();
	}

  render() {
    if(loading) {
      return <div>Loading..</div>
    }
    else {
      if(!id) {
        // askforid
      }
      else if(!board) {
        // error
      }
    }

    return (
      <div className={style.root}>
	      {JSON.stringify(this.props)}
      </div>
    )
  }
}
