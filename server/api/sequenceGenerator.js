const cardmap = require('../../client/utils/cardmap');
const initialBufferTime = 0 * 60 * 1000; // 1 min

module.exports = function generateInitialState({ gameId, players, teamCount }) {
	const initialDeck = getInitialDeck();
	const { hands, totalCardsDistributed } = assignHandsToPlayers(
		players,
		initialDeck,
	);
	const teams = {
		0: { color: 'red' },
		1: { color: 'blue' },
		2: { color: 'green' },
	};
	const board = [...Array(10)].map(() => new Array(10).fill(null));
	const playerDetails = assignTeamsToPlayers(
		players,
		teamCount,
		Object.keys(teams),
	);
	const turns = assignPlayerOrder(playerDetails);

	return {
		game: { id: gameId },
		deck: initialDeck.slice(totalCardsDistributed),
		players: playerDetails,
		board,
		teams,
		hands,
		current: {
			id: turns[0],
			iteration: 0,
			start: new Date().getTime() + initialBufferTime,
		},
		order: turns,
	};
};

function getInitialDeck() {
	return shuffle(
		cardmap
			.filter(v => v !== 'open')
			.concat(['11_c', '11_d', '11_s', '11_h'])
			.concat(['11_c', '11_d', '11_s', '11_h']),
	);
}

function assignHandsToPlayers(players, deck) {
	const allCards = deck.slice(0);
	if ((players.length % 2 === 1 && players.length != 3) || players.length < 2) {
		throw new Error('Invalid number of players!');
	} else {
		const hands = {};
		players.forEach(player => {
			if (players.length === 2) {
				hands[player] = allCards.splice(0, 7);
			} else if (players.length === 3) {
				hands[player] = allCards.splice(0, 6);
			} else if (players.length === 4) {
				hands[player] = allCards.splice(0, 6);
			} else if (players.length === 6) {
				hands[player] = allCards.splice(0, 5);
			}
		});
		return {
			hands,
			totalCardsDistributed: deck.length - allCards.length,
		};
	}
}

function assignTeamsToPlayers(players, teamCount, teamIds) {
	const playersObject = {};
	if (players.length < 4) {
		players.forEach((player, idx) => {
			playersObject[player] = {
				name: player,
				team: teamIds[idx],
			};
		});
	} else if (players.length % teamCount !== 0) {
		throw new Error(`Invalid team division: ${players.length} / ${teamCount}`);
	} else {
		const selection = players.slice(0);
		const teamSize = players.length / teamCount;
		let i = 0;
		while (selection.length) {
			const currentTeam = teamIds[i];
			selection.splice(0, teamSize).forEach(player => {
				playersObject[player] = {
					name: player,
					team: currentTeam,
				};
			});
			i++;
		}
	}
	return playersObject;
}

function assignPlayerOrder(players) {
	const order = [];
	const playersNameList = Object.keys(players);
	const groupByTeam = playersNameList.reduce((acc, player) => {
		const currentTeam = players[player].team;
		if (Object.keys(acc).includes(currentTeam)) {
			return acc;
		}
		acc[currentTeam] = playersNameList.filter(
			p => players[p].team === currentTeam,
		);
		return acc;
	}, {});
	let hasItems = true;
	while (hasItems) {
		Object.keys(groupByTeam).forEach(team => {
			if (groupByTeam[team].length < 1) {
				hasItems = false;
			}
			if (hasItems) {
				order.push(groupByTeam[team].splice(0, 1)[0]);
			}
		});
	}
	return order;
}

function shuffle(array) {
	let currentIndex = array.length,
		temporaryValue,
		randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex !== 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}
