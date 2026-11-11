// The command resolution in progress.
export { getCurrentCommandResolutionState } from './getCurrentCommandResolutionState';

// That resolution when the command is a movement.
export { getMovementResolutionState } from './getMovementResolutionState';

// That resolution when the command is a ranged attack.
export { getRangedAttackResolutionState } from './getRangedAttackResolutionState';

// The same readings, for a caller asking whether an order is under way.
// These answer `undefined` where the getters above throw.
export { findCurrentCommandResolutionState } from './findCurrentCommandResolutionState';
export { findMovementResolutionState } from './findMovementResolutionState';
export { findRangedAttackResolutionState } from './findRangedAttackResolutionState';
