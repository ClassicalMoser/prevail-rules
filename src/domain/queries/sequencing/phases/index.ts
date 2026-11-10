// The phase in progress. A named getter throws unless that phase is current.
export { getCurrentPhaseState } from './getCurrentPhaseState';
export { getPlayCardsPhaseState } from './getPlayCardsPhaseState';
export { getMoveCommandersPhaseState } from './getMoveCommandersPhaseState';
// Whose commander moves next, passing over a side whose commander has fallen.
export { getMoveCommandersStepFrom } from './getMoveCommandersStepFrom';
export { getIssueCommandsPhaseState } from './getIssueCommandsPhaseState';
export { getResolveMeleePhaseState } from './getResolveMeleePhaseState';
export { getCleanupPhaseState } from './getCleanupPhaseState';
