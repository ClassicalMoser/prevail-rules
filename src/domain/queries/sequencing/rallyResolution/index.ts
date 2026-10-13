// One player's rally during cleanup.
export { getRallyResolutionState } from './rally';

// The rally for the cleanup step now in progress.
export { getCurrentRallyResolutionState } from './rally';

// The rout stored on a rally.
export { getRoutStateFromRally } from './rally';

// The rout for the cleanup step that is resolving a rally, including choose-rally.
export { getRoutStateFromCleanupPhaseForResolveRout } from './rally';

// The rally for this resolve step, for the player whose step it is.
export { getRallyResolutionStateForCurrentStep } from './cleanupPhase';

// That rally after the player chose to rally, before the burn.
export { getRallyResolutionStateAwaitingBurn } from './cleanupPhase';

// That rally after the burn, before support is assigned.
export { getRallyResolutionStateAwaitingUnitSupport } from './cleanupPhase';

// Whether this resolve-rally step belongs to the initiative player.
export { getIsFirstPlayerForResolveRallyStep } from './cleanupPhase';

// The cleanup step that follows the current resolve-rally step.
export { getNextStepForResolveRally } from './cleanupPhase';
