// What a whole move is bound by, and how it is settled where the move begins.
export type { MoveContext } from './moveContext';
export { createMoveContext } from './createMoveContext';

// The point a move begins from, its budget unspent.
export { getStartState } from './getStartState';

// One point in a move in progress, and one place a move may legally end.
export type { MoveState } from './moveState';
export type { MoveResult } from './moveResult';

// The turns and the step open from a point, the point a turn reaches, and
// whether the move may end there.
export { getTurnOptions } from './getTurnOptions';
export { getTurnedState } from './getTurnedState';
export { getStepOption } from './getStepOption';
export { getMoveEnding } from './getMoveEnding';

// Every place a move may legally end, found by walking its steps and turns.
export { exploreUnitMoves } from './exploreUnitMoves';
