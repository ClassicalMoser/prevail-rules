// The rally for this resolve step, for the player whose step it is.
export { getRallyResolutionStateForCurrentStep } from './getRallyResolutionStateForCurrentStep';

// That rally after the player chose to rally, before the burn.
export { getRallyResolutionStateAwaitingBurn } from './getRallyResolutionStateAwaitingBurn';

// Whether a rally is at the point where its player assigns unit support.
export { isAwaitingUnitSupport } from './isAwaitingUnitSupport';

// That rally after the burn, before support is assigned.
export { getRallyResolutionStateAwaitingUnitSupport } from './getRallyResolutionStateAwaitingUnitSupport';

// The player whose rally the cleanup step is on.
export { findRallyingPlayer } from './findRallyingPlayer';
export { getRallyingPlayer } from './getRallyingPlayer';

// The cleanup step that follows the current resolve-rally step.
export { getNextStepForResolveRally } from './getNextStepForResolveRally';
