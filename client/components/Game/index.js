import styles from '../styles.css';
import uid from '../../utils/uid';
import React, { Component } from 'react';
import CardChooseDialog from '../ChooseCard';
import Cell from '../Cell';
import Toast from '../Toast';
import Timer from '../Timer';
import History from '../History';
import { timeoutMs } from '../../utils/constants';
import { isPartOfSequence } from '../../utils/sequence';
import cardmap from '../../utils/cardmap';
import io from 'socket.io-client';
import classnames from 'classnames';

export default class Game extends Component {
	constructor(props) {
		super(props);
		this.uid_ = uid();
		this.state = { cardOptions: [] };
		this.highlightLocation_ = this.highlightLocation_.bind(this);
		this.socket_ = this.setupSocket();
	}

	componentDidMount() {
		this.props.actions.fetchGame(this.props.params.gameId, this.uid_);
	}

	setupSocket() {
		const socket = io('//');
		socket.on('connect', () => {
			console.log('socket_connection_ok');
		});
		socket.on('client_update_game', ({ id, card, coord }) => {
			if (this.props.id !== id) {
				console.log('refresh_board');
				this.componentDidMount();
				this.highlightLast_(coord);
			}
			this.refs.historyBox.onMessage({
				message: card,
				type: 'update',
				id,
			});
		});
		socket.on('client_update_chat', data => {
			console.log('socket_client_update_chat', data);
			this.refs.historyBox.onMessage(data);
		});
		socket.on('disconnect', () => {
			console.log('socket_disconnection');
		});
		return socket;
	}

	highlightLast_([x, y]) {
		try {
			const cl = styles['lhover'];
			const el = document
				.querySelectorAll(`.${styles['board']} tr`)
				[x].querySelectorAll('td')[y];
			el.classList.add(cl);
			setTimeout(() => el.classList.remove(cl), 2000);
		} catch (e) {
			console.log(e);
		}
	}

	broadCastMove(card, coord) {
		console.log('socket_server_play');
		setTimeout(
			() =>
				this.socket_.emit('server_play', {
					id: this.props.id,
					card,
					coord,
				}),
			200,
		);
	}

	broadCastMessage({ type, message }) {
		console.log('socket_server_chat');
		setTimeout(
			() =>
				this.socket_.emit('server_chat', {
					id: this.props.id,
					type,
					message,
				}),
			200,
		);
	}

	componentWillUnmount() {
		this.socket_.disconnect();
	}

	allowedToPlay() {
		const { id, start } = this.props.current;
		return String(id) === String(this.props.id) && !this.isTimedOut_(start);
	}

	canPlayCard(card, isFilled, slot) {
		const isAlreadyPartOfSequence = isPartOfSequence(this.props.board, slot);
		return this.props.hands.filter(handCard => {
			if (isFilled) {
				if (!isAlreadyPartOfSequence) {
					return ['11_s', '11_h'].includes(handCard);
				}
				return false;
			} else {
				return [card, '11_d', '11_c'].includes(handCard);
			}
		});
	}

	getPlayableCards(cellId) {
		const selectedCard = cardmap[cellId];
		const x = Math.floor(cellId / 10);
		const y = cellId % 10;
		const slotFilled = Boolean(this.props.board[x][y]);
		return this.canPlayCard(selectedCard, slotFilled, [x, y]);
	}

	commitPlay(cellId) {
		if ([0, 9, 90, 99].includes(cellId)) {
			return;
		}
		const x = Math.floor(cellId / 10);
		const y = cellId % 10;
		const playableCards = this.getPlayableCards(cellId);
		if (!this.allowedToPlay() || playableCards.length < 1) {
			return;
		}
		if (playableCards.length === 1) {
			this.dropHand_(playableCards[0], [x, y]);
		} else {
			this.chooseCardsOnConflict(playableCards, [x, y]);
		}
	}

	resolveConflictedCard(card) {
		this.setState({ cardOptions: [] }, () => {
			this.dropHand_(card, this.state.slot);
		});
	}

	chooseCardsOnConflict(playableCards, slot) {
		this.setState({ cardOptions: playableCards, slot });
	}

	dropHand_(card, [x, y], skipTurn = false) {
		let { deck, board, order, hands, id, current } = this.props;
		const myIndex = order.findIndex(v => String(v) === String(id));
		const nextIndex = myIndex >= order.length - 1 ? 0 : myIndex + 1;

		console.log('drophand', card, [x, y]);

		if (skipTurn === false) {
			const pickedCard = deck.splice(0, 1);
			board[x][y] = card === '11_s' || card === '11_h' ? null : { id };
			hands.splice(
				hands.findIndex(v => v === card),
				1,
				pickedCard[0],
			);

			// animate
			const currentCard = document.querySelector(
				`.${styles['hand']} .${styles['card_' + card]}`,
			);
			setTimeout(
				(function(el) {
					return () => {
						el.classList.add(styles['card_new']);
					};
				})(currentCard),
				500,
			);

			this.broadCastMove(card, [x, y]);
		}

		const nextState = {
			board,
			deck,
			hands,
			current: {
				id: order[nextIndex],
				iteration: current.iteration + 1,
				start: new Date().getTime(),
			},
		};

		this.setNextState(nextState);
	}

	setNextState(state) {
		this.props.actions.setGameState(this.uid_, this.props.params.gameId, state);
	}

	onTimeOut() {
		let { order, current, id } = this.props;
		if (current.id === id) {
			this.dropHand_(null, [], true);
		} else {
			// lets say other player leaves the game / becomes offline.
			const theirIndex = order.findIndex(v => String(v) === String(current.id));
			const nextIndex = theirIndex >= order.length - 1 ? 0 : theirIndex + 1;
			this.setNextState({
				current: {
					id: order[nextIndex],
					iteration: current.iteration + 1,
					start: new Date().getTime(),
				},
			});
		}
	}

	showToast(message) {
		this.setState({ message });
	}

	render() {
		const {
			loading,
			game,
			id,
			players,
			board,
			current,
			hands,
			deck,
		} = this.props;

		if (loading) {
			return <Error message='loading...' />;
		} else if (loading === false && !game) {
			return <Error message='Invalid game id' />;
		}

		const myColor = this.getColor_(id);
		let counter = -1;

		return (
			<div className={classnames(styles['game'])}>
				<table className={styles['board']}>
					<tbody>
						{board.map(row => (
							<tr key={counter + 1}>
								{row.map(cell => {
									const color = cell ? this.getColor_(cell.id) : null;
									counter = counter + 1;
									return (
										<Cell
											key={counter}
											onMouseOver={this.highlightLocation_.bind(
												this,
												1,
												cardmap[counter],
												counter,
											)}
											onMouseOut={this.highlightLocation_.bind(
												this,
												0,
												cardmap[counter],
												counter,
											)}
											onDoubleClick={this.commitPlay.bind(this, counter)}
											className={classnames(
												styles['card'],
												styles[`card_${cardmap[counter]}`],
											)}
											color={color}
										/>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
				<div>
					<div
						className={classnames(
							this.isMyTurn() && [styles['alert'], styles[myColor]],
							styles['control'],
						)}>
						<a
							href={'javascript:void(0)'}
							className={styles['highlightall']}
							onMouseOver={this.highlightAll_.bind(this, true)}
							onMouseOut={this.highlightAll_.bind(this, false)}>
							[highlight_all]
						</a>
						<ul className={styles['hand']}>
							{hands.map((c, i) => {
								return (
									<li
										key={i}
										onMouseOver={this.highlightLocation_.bind(this, 1, c)}
										onMouseOut={this.highlightLocation_.bind(this, 0, c)}>
										<div
											className={classnames(
												styles['card'],
												styles[`card_${c}`],
											)}
										/>
									</li>
								);
							})}
						</ul>
						<ul className={styles['players']}>
							{Object.keys(players).map((player, i) => (
								<li
									key={i}
									className={classnames(
										current.id === player && styles['current'],
									)}>
									<Avatar
										current={current.id === player}
										id={player}
										color={this.getColor_(player)}
									/>
								</li>
							))}
						</ul>
						<div className={styles['players-container']}>
							<h3 className={styles['title']}>
								<div className={styles['small']}>{current.id}</div>
								<Timer
									start={current.start}
									onTimeout={this.onTimeOut.bind(this)}
								/>
							</h3>
						</div>
					</div>
					<History
						ref={'historyBox'}
						messages={[]}
						onSend={this.broadCastMessage.bind(this)}
					/>
				</div>
				<CardChooseDialog
					options={this.state.cardOptions}
					onClose={this.resolveConflictedCard.bind(this)}
				/>
				{this.state.message ? <Toast message={this.state.message} /> : null}
			</div>
		);
	}

	isTimedOut_(start, now = new Date().getTime()) {
		return now - start > timeoutMs;
	}

	isMyTurn() {
		return String(this.props.current.id) === String(this.props.id);
	}

	highlightLocation_(inside, card, cellId) {
		const sel = `.${styles['board']} .${styles[`card_${card}`]}`;
		const els = document.querySelectorAll(sel);
		let cls;
		if (cellId > -1) {
			cls = `${styles['chover']}`;
			if (this.getPlayableCards(cellId).length && inside) {
				els.forEach(el => el.classList.add(cls));
			} else {
				els.forEach(el => el.classList.remove(cls));
			}
		} else {
			cls = `${styles['hover']}`;
			inside
				? els.forEach(el => el.classList.add(cls))
				: els.forEach(el => el.classList.remove(cls));
		}
	}

	highlightAll_(mousein) {
		this.props.hands.forEach(hand => {
			const sel = document.querySelectorAll(
				`.${styles['board']} .${styles[`card_${hand}`]}`,
			);
			sel.forEach(e => {
				if (mousein) e.classList.add(`${styles['hover']}`);
				else e.classList.remove(`${styles['hover']}`);
			});
		});
	}

	getColor_(id) {
		const { teams, players } = this.props;
		return teams[players[id].team].color;
	}
}

const Avatar = ({ id, color, current, online }) => {
	return (
		<div
			className={classnames(
				styles['avatar-box'],
				current && styles['avatar-current'],
				!online && styles['avatar-online'],
			)}>
			<img
				src={`https://moma-teams-photos.corp.google.com/photos/${id}?sz=64`}
				title={id}
				alt={id.slice(0, 4)}
				className={classnames(styles['avatar'], styles[`avatar-${color}`])}
			/>
		</div>
	);
};

const Error = props => {
	return <Toast message={props.message || 'something went wrong.'} />;
};
