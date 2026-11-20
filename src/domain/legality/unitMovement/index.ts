// What a space allows a mover: ending there, going on through it, and
// slipping past its corners on a diagonal.
export { canMoveInto, canMoveThrough, checkDiagonalMove } from './passage';

// Stepping into an enemy: whether it is legal, and the facing it ends on.
export { canEngageEnemy, getEngagementEndFacing } from './engaging';

// One legal ending of a move, with its cost and the path that reaches it.
export type { MoveResult } from './explore';

// Every ending a unit may reach with an ordered move.
export { getLegalUnitMoves } from './getLegalUnitMoves';

// Which of two moves is smaller, and the smallest way to each ending a move
// may reach: the plain way for a player who chose only where to end.
export { compareMoveSize, getSmallestMovePerEnding } from './size';

// The smallest legal fall-backs when combat forces a retreat.
export { getLegalRetreats } from './retreat';

// What a player may do next in a move they are writing.
export type { LegalMoveDeltas } from './path';
export { findLegalMoveDeltas } from './path';

// A set of move endings written down in board order, an order that means nothing.
export { listMovesInBoardOrder } from './listMovesInBoardOrder';
