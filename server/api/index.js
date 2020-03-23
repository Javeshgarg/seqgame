const express = require('express');
const bodyParser = require('body-parser');
const generateInitialState = require('./sequenceGenerator');

// Automatically parse request body as JSON
const router = express.Router();
router.use(bodyParser.json());

const authTokens = {
	jv83: 'javesh',
	py32: 'priyankadhaka',
	ps92: 'prashanthanand',
	v42: 'vikramsr',
	a25: 'achut',
	d20: 'debajitdey',
	p71: 'prateekv',
	k93: 'karthikc',
	k39: 'kmdeepika',
	h43: 'hari',
	a29: 'ajay',
};

let games = {};

/**
 * GET /api/roomslist
 * Retrieve all games for debugging.
 */
router.get('/roomslist', async (req, res) => {
	res.json(games);
});

/**
 * GET /api/room/:game
 * Retrieve a game room data.
 */
router.get('/room/:game', async (req, res) => {
	const game = req.params.game;
	const uid = req.query.uid;
	if (!uid || !games.hasOwnProperty(game)) {
		res.json({
			game: null,
		});
	} else {
		const gameObject = { ...games[game] };
		gameObject.hands = gameObject.hands[authTokens[uid]];
		res.json({ id: authTokens[uid], ...gameObject });
	}
});

/**
 * POST /api/room/
 * Add a game room data.
 */
router.post('/room', async (req, res) => {
	const { players } = req.body;
	const teamCount = req.body.teamCount || 0;
	const gameId = new Date().getTime();
	const uid = req.query.uid;
	if (!uid) {
		res.json({
			game: null,
		});
		return;
	}
	const initialState = generateInitialState({
		gameId,
		players,
		teamCount,
	});
	games[gameId] = initialState;
	res.json({ ...initialState });
});

/**
 * PUT /api/room/:game
 * Update a game room data.
 */
router.put('/room/:game', async (req, res) => {
	const { board, hands, deck, current } = req.body;
	const gameId = req.params.game;
	const uid = req.query.uid;
	if (!uid || !games.hasOwnProperty(gameId)) {
		res.json({
			game: null,
		});
	} else {
		const gameObject = games[gameId];
		const lastIteration = gameObject.current.iteration;
		if (Number(current.iteration) - Number(lastIteration) === 1) {
			games[gameId] = {
				...gameObject,
				board: board || gameObject.board,
				deck: deck || gameObject.deck,
				current,
			};
			if (hands) {
				games[gameId].hands[authTokens[uid]] = hands;
			}
			res.json({ ...games[gameId], hands });
		} else {
			res.json({ ...gameObject, hands: gameObject.hands[authTokens[uid]] });
		}
	}
});

/**
 * DELETE /api/room
 * Clean up.
 */
router.delete('/room/:game', async (req, res) => {
	games = {};
	res.json({ done: true });
});

/**
 * GET /api/auth/:token
 * Allow access to valid user tokens.
 */
router.get('/auth/:token', async (req, res) => {
	res.json({
		id: authTokens[req.params.token],
	});
});

module.exports = router;
