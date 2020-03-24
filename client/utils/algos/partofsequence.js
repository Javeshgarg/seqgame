/**
 * Returns if given [x, y] in board[][] is part of a sequence.
 * board[][] has two possible values null or {id: xxx} representing a coin.
 */
export default function isPartOfSequence(board, [x, y]) {
	const horizontal = horizontals(board, [x, y]);
	const vertical = verticals(board, [x, y]);
	const boardXLength = board.length;
	const boardYLength = board[0].length;
	const isHorizontalCorner = x === 0 || x === boardXLength - 1;
	const isVerticalCorner = y === 0 || y === boardYLength - 1;
	const hasWildcardNWDiagonal = x === y;
	const hasWildcardNEDiagonal = x + y === boardXLength - 1;

	return (
		hasConsecutives(horizontal, isHorizontalCorner) ||
		hasConsecutives(vertical, isVerticalCorner) ||
		hasConsecutives(nortWestDiagonals(board, [x, y]), hasWildcardNWDiagonal) ||
		hasConsecutives(northEastDiagonals(board, [x, y]), hasWildcardNEDiagonal)
	);
}

function horizontals(board, [x, y]) {
	return board[x];
}

function verticals(board, [x, y]) {
	return board.map(row => row[y]);
}

function nortWestDiagonals(board, [x, y]) {
	const boardXLength = board.length;
	const boardYLength = board[0].length;
	let px = x - 1,
		py = y - 1;
	const northWestDiagonal = [board[x][y]];
	while (px >= 0 && py >= 0) {
		northWestDiagonal.unshift(board[px][py]);
		px--;
		py--;
	}
	px = x + 1;
	py = y + 1;
	while (px <= boardXLength - 1 && py <= boardYLength - 1) {
		northWestDiagonal.push(board[px][py]);
		px++;
		py++;
	}
	return northWestDiagonal;
}

function northEastDiagonals(board, [x, y]) {
	const boardXLength = board.length;
	const boardYLength = board[0].length;
	let px = x + 1,
		py = y - 1;
	const northEastDiagonal = [board[x][y]];
	while (px <= boardXLength - 1 && py >= 0) {
		northEastDiagonal.unshift(board[px][py]);
		px++;
		py--;
	}
	px = x - 1;
	py = y + 1;
	while (px >= 0 && py <= boardYLength - 1) {
		northEastDiagonal.push(board[px][py]);
		px--;
		py++;
	}
	return northEastDiagonal;
}

function hasConsecutives(arr, isCorner, length = 5) {
	let i = 0,
		counter = 0;
	while (i < arr.length) {
		if (arr[i] !== null) {
			counter++;
		} else if (isCorner && (i === 0 || i === arr.length - 1)) {
			counter++;
		} else {
			counter = 0;
		}
		if (counter === length) {
			return true;
		}
		i++;
	}
	return false;
}
