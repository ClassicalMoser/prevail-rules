// What a space allows a mover: ending there, going on through it, and
// slipping past its corners on a diagonal.
export { canMoveInto, canMoveThrough, checkDiagonalMove } from './passage';

// Stepping into an enemy: whether it is legal, and the facing it ends on.
export { canEngageEnemy, getEngagementEndFacing } from './engaging';

// Every placement a unit may end an ordered move on.
export { getLegalUnitMoves } from './getLegalUnitMoves';

// The smallest legal fall-backs when combat forces a retreat.
export { getLegalRetreats } from './retreat';

// Whether one proposed move is among the legal ones.
export { isLegalMove } from './isLegalMove';
