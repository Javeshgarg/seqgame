import styles from '../styles.css';
import React, { Component } from 'react';
import classnames from 'classnames';

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

	onTextChange(e) {
		this.setState({ message: e.target.value });
	}

	onFormSubmit(e) {
		e.preventDefault();
		const message = this.state.message;
		this.setState({ message: null });
		setTimeout(() => {
			if (message.startsWith('>')) {
				this.sendMessage('funny', message.slice(1));
			} else if (message.includes('open.spotify.com')) {
				this.sendMessage('music', this.getSongURI(message));
			} else {
				this.sendMessage('normal', message);
			}
		}, 100);
	}

	getSongURI(url) {
		try {
			const match = /(track|playlist|album)\/(.*)/.exec(url);
			return match[0].split('?')[0];
		} catch (e) {
			return 'track/5fXslGZPI5Cco6PKHzlSL3';
		}
	}

	sendMessage(type, message) {
		this.props.onSend({ type, message });
	}

	onMessage({ id, type, message }) {
		if (type === 'funny') {
			// todo debounce.
			say(message);
		} else if (type === 'music') {
			setTimeout(() => this.playMusic(message), 100);
		}
		this.setState(state => {
			return {
				...state,
				messages: [{ message, id, type }].concat(state.messages),
			};
		});
	}

	playMusic(trackId) {
		this.refs.player &&
			(this.refs.player.src = `https://open.spotify.com/embed/${trackId}`);
	}

	cleanUpMusic() {
		this.cleanUpTimeoutObj_ && clearTimeout(this.cleanUpTimeoutObj_);
		this.cleanUpTimeoutObj_ = setTimeout(() => {
			this.refs.player && (this.refs.player.src = 'about:blank');
		}, 30000);
	}

	parseMessage({ message, id, type }) {
		if (type === 'funny') {
			return (
				<div className={styles['funny-message']}>
					{id} : {message}
				</div>
			);
		} else if (type === 'music') {
			return (
				<div className={styles['update-message']}>
					<img
						src={`https://moma-teams-photos.corp.google.com/photos/${id}?sz=64`}
						title={id}
						alt={id.slice(0, 4)}
						className={classnames(styles['avatar'])}
					/>{' '}
					wants to play song. Tap the play button!
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
						placeholder={'send messages.'}
						onChange={this.onTextChange}
					/>
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
				<div className={'player'}>
					<iframe
						src={'about:blank'}
						width='300'
						height='100'
						ref={'player'}
						className={styles['music_player']}
						frameborder='0'
						onLoad={this.cleanUpMusic.bind(this)}
						allowtransparency='true'
						allow='encrypted-media'
					/>
				</div>
			</div>
		);
	}
}
