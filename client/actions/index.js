import { createAction } from 'redux-actions';
import api from '../utils/api';

export const fetchGame = (gameId, uid) => {
	return dispatch => {
		api(`/api/room/${gameId}?uid=${uid}`).then(json =>
			dispatch({ type: 'get_game', data: json }),
		);
	};
};

export const setGameState = (uid, gameId, state) => {
	return dispatch => {
		api(`/api/room/${gameId}?uid=${uid}`, {
			method: 'put',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(state),
		}).then(json => dispatch({ type: 'get_game', data: json }));
	};
};
