// One player's rally during cleanup.
export { findRallyResolutionState } from './findRallyResolutionState';
export { getRallyResolutionState } from './getRallyResolutionState';

// The rally for the cleanup step now in progress.
export { getCurrentRallyResolutionState } from './getCurrentRallyResolutionState';

// A rally's rout is exported from `combatOutcomes/rout`, beside the other
// parents that can hold one.

// The rally for this resolve step, for the player whose step it is.
export { getRallyResolutionStateForCurrentStep } from './cleanupPhase';

// That rally after the player chose to rally, before the burn.
export { getRallyResolutionStateAwaitingBurn } from './cleanupPhase';

// That rally after the burn, before support is assigned.
export { getRallyResolutionStateAwaitingUnitSupport } from './cleanupPhase';

// The player whose rally the cleanup step is on.
export { findRallyingPlayer, getRallyingPlayer } from './cleanupPhase';

// Whether a rally is at the point where its player assigns unit support.
export { isAwaitingUnitSupport } from './cleanupPhase';

// The cleanup step that follows the current resolve-rally step.
export {
  getNextStepForChooseRally,
  getNextStepForResolveRally,
} from './cleanupPhase';
