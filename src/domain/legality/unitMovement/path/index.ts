// Where a path written so far has brought a move, and following it there.
export type { MovePosition } from './movePosition';
export { followMovePrefix } from './followMovePrefix';

// What a player may do next in a move, and the offering itself.
export type { LegalMoveDeltas } from './legalMoveDeltas';
export { findLegalMoveDeltas } from './findLegalMoveDeltas';
