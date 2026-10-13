// The rally for this resolve step, for the player whose step it is.
export { getRallyResolutionStateForCurrentStep } from './getRallyResolutionStateForCurrentStep';

// That rally after the player chose to rally, before the burn.
export { getRallyResolutionStateAwaitingBurn } from './getRallyResolutionStateAwaitingBurn';

// That rally after the burn, before support is assigned.
export { getRallyResolutionStateAwaitingUnitSupport } from './getRallyResolutionStateAwaitingUnitSupport';

// Whether this resolve-rally step belongs to the initiative player.
export { getIsFirstPlayerForResolveRallyStep } from './getIsFirstPlayerForResolveRallyStep';

// The cleanup step that follows the current resolve-rally step.
export { getNextStepForResolveRally } from './getNextStepForResolveRally';
