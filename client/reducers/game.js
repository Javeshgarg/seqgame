import { handleActions } from 'redux-actions';

const initialState = {
	loading: true,
};

export default handleActions(
	{
		get_game(state, { type, data }) {
			return {
				...state,
				...data,
				loading: false,
			};
		},
		set_game(state, { type, data }) {
			return {
				...state,
				...data,
				loading: false,
			};
		},
	},
	initialState,
);
