// The phase in progress. A named getter throws unless that phase is current.
export { getCurrentPhaseState } from './getCurrentPhaseState';
export { getPlayCardsPhaseState } from './getPlayCardsPhaseState';
export { getMoveCommandersPhaseState } from './getMoveCommandersPhaseState';
// Whose commander moves next, passing over a side whose commander has fallen.
export { getMoveCommandersStepFrom } from './getMoveCommandersStepFrom';
export { getIssueCommandsPhaseState } from './getIssueCommandsPhaseState';
// Who still has something to give or to do in Phase 3, by player.
export { getRemainingCommandsForPlayer } from './getRemainingCommandsForPlayer';
export { getRemainingUnitsForPlayer } from './getRemainingUnitsForPlayer';
// Whose orders the step is on, and the steps that follow issuing and carrying
// them out.
export { getCommandingPlayer } from './getCommandingPlayer';
export { getResolveStepAfterIssuing } from './getResolveStepAfterIssuing';
export { getStepAfterResolvingCommands } from './getStepAfterResolvingCommands';
export { getResolveMeleePhaseState } from './getResolveMeleePhaseState';
export { getCleanupPhaseState } from './getCleanupPhaseState';
