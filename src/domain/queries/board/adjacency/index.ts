// Up to four cardinally adjacent coordinates, no diagonals.
export { getOrthogonallyAdjacentSpaces } from './getOrthogonallyAdjacentSpaces';

// Up to four diagonally adjacent coordinates, no orthogonals.
export { getDiagonallyAdjacentSpaces } from './getDiagonallyAdjacentSpaces';

// All neighbors that exist on the board, up to eight (orthogonal and diagonal).
export { getAdjacentSpaces } from './getAdjacentSpaces';

// Front arc: up to three spaces ahead (forward plus the two flanking diagonals).
// TODO(misleading): "flanking" is the rules' word for the two spaces at 90°
// (§2.3.2), not the diagonals ahead; settle as "the two diagonals ahead".
export { getFrontSpaces } from './getFrontSpaces';

// The two spaces left and right of the facing, clipped to the board.
export { getFlankingSpaces } from './getFlankingSpaces';

// Rear arc: up to three spaces behind the facing, including diagonals.
export { getBackSpaces } from './getBackSpaces';

// Which of those three sides a given neighbour lies on.
export { findNeighbourSide } from './findNeighbourSide';
