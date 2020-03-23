import React, { Component } from 'react';
import style from './style.css';

export default class Home extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		if (!this.props.id) {
			this.props.actions.fetchId();
		}
	}

	render() {
		const { id } = this.props;
		return <div className={style.root}>{JSON.stringify(this.props)}</div>;
	}
}
