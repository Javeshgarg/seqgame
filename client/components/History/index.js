import styles from '../styles.css';
import React, { Component } from 'react';
import classnames from 'classnames';

const bakaithiTexts = ['everything is gonna be ok', 'test', 'awesome'];

function say(m) {
	const msg = new SpeechSynthesisUtterance();
	const voices = window.speechSynthesis
		.getVoices()
		.filter(v => v.name == 'Cellos')[0];
	msg.voice = voices;
	msg.volume = 0.5;
	msg.rate = 1;
	msg.pitch = 0.5;
	msg.text = m;
	msg.lang = 'en-US';
	speechSynthesis.speak(msg);
}

export default class History extends Component {
	constructor(props) {
		super(props);
		this.state = {
			message: null,
			messages: props.messages,
		};
		this.onTextChange = this.onTextChange.bind(this);
		this.onFormSubmit = this.onFormSubmit.bind(this);
	}

	componentDidMount() {}

	onTextChange(e) {
		this.setState({ message: e.target.value });
	}

	onFormSubmit(e) {
		e.preventDefault();
		const message = this.state.message;
		this.setState({ message: null });
		setTimeout(() => this.sendMessage('normal', message), 100);
	}

	sendMessage(type, message) {
		this.props.onSend({ type, message });
	}

	onMessage({ id, type, message }) {
		if (type === 'funny') {
			// todo debounce.
			say(message);
		}
		this.setState(state => {
			return {
				...state,
				messages: [{ message, id, type }].concat(state.messages),
			};
		});
	}

	parseMessage({ message, id, type }) {
		if (type === 'funny') {
			return (
				<div className={styles['funny-message']}>
					{id} : {message}
				</div>
			);
		} else if (type === 'normal') {
			return (
				<div className={styles['normal-message']}>
					{id} : {message}
				</div>
			);
		} else if (type === 'update') {
			return (
				<div className={styles['update-message']}>
					<img
						src={`https://moma-teams-photos.corp.google.com/photos/${id}?sz=64`}
						title={id}
						alt={id.slice(0, 4)}
						className={classnames(styles['avatar'])}
					/>
					<div
						className={classnames(
							styles['card'],
							styles['card_' + message],
						)}></div>
				</div>
			);
		}
	}

	render() {
		return (
			<div className={styles['history-container']}>
				<form onSubmit={this.onFormSubmit}>
					<input
						className={styles['chat-input']}
						type={'text'}
						value={this.state.message || ''}
						placeholder={'type and enter.'}
						onChange={this.onTextChange}
					/>
					<label htmlFor={'toggle'}>
						<div onClick={() => {}} className={styles['speech-bubble']}>
							<span>...</span>
						</div>
					</label>
					<input type='checkbox' id='toggle' className={styles['fun-toggle']} />
					<ul className={styles['fun-messages']}>
						{bakaithiTexts.map(message => {
							return (
								<li
									onClick={this.sendMessage.bind(this, 'funny', message)}
									className={styles['fun-message']}>
									{message}
								</li>
							);
						})}
					</ul>
				</form>
				<ul className={styles['messages']}>
					{this.state.messages.map(message => {
						return (
							<li className={styles['message']}>
								{typeof message === 'string'
									? message
									: this.parseMessage(message)}
							</li>
						);
					})}
				</ul>
			</div>
		);
	}
}
