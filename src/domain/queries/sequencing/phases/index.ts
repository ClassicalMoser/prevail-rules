// The phase in progress. A named getter throws unless that phase is current.
export { getCurrentPhaseState } from './getCurrentPhaseState';
export { getPlayCardsPhaseState } from './getPlayCardsPhaseState';
export { getMoveCommandersPhaseState } from './getMoveCommandersPhaseState';
// Whose commander moves next, passing over a side whose commander has fallen.
export { getMoveCommandersStepAfter } from './getMoveCommandersStepAfter';
export { getIssueCommandsPhaseState } from './getIssueCommandsPhaseState';
// Who still has a unit to act in Phase 3, by player.
export { getRemainingUnitsForPlayer } from './getRemainingUnitsForPlayer';
// Whose orders the step is on, and the steps that follow issuing and carrying
// them out.
export { getCommandingPlayer } from './getCommandingPlayer';
export { getResolveStepAfterIssuing } from './getResolveStepAfterIssuing';
export { getStepAfterResolvingCommands } from './getStepAfterResolvingCommands';
export { getResolveMeleePhaseState } from './getResolveMeleePhaseState';
export { getCleanupPhaseState } from './getCleanupPhaseState';
