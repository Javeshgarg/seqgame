import React, { Component } from 'react';
import { timeoutMs } from '../../utils/constants';

export default class Timer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pendingSeconds: Math.round(
				(timeoutMs - (new Date().getTime() - props.start)) / 1000,
			),
		};
	}

	componentDidMount() {
		this.intv_ = setInterval(() => {
			const pendingSeconds = this.state.pendingSeconds;
			if (pendingSeconds <= 0) {
				clearInterval(this.intv_);
				this.props.onTimeout();
				return;
			}
			this.setState({ pendingSeconds: pendingSeconds - 1 });
		}, 1000);
	}

	componentWillReceiveProps(nextProps) {
		clearInterval(this.intv_);

		this.setState({
			pendingSeconds: Math.round(
				(timeoutMs - (new Date().getTime() - nextProps.start)) / 1000,
			),
		});
		this.componentDidMount();
	}

	componentWillUnmount() {
		clearInterval(this.intv_);
	}

	render() {
		let pendingSeconds = this.state.pendingSeconds;
		pendingSeconds = Math.max(pendingSeconds, 0);
		const pendingMins = Math.floor(pendingSeconds / 60);
		pendingSeconds -= pendingMins * 60;
		return (
			<span
				className={`timer ${this.props.className} ${
					pendingMins === 0 ? 'pulse' : ''
				}`}>
				{pendingMins}:
				{pendingSeconds > 9 ? pendingSeconds : `0${pendingSeconds}`}
			</span>
		);
	}
}
