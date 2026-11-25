// Phase 1 is over: both cards are face up and initiative settled.
export { generateCompletePlayCardsPhaseEvent } from './generateCompletePlayCardsPhaseEvent';
// A fallen commander's Move Commanders turn is passed over.
export { generateSkipLostCommanderMoveEvent } from './generateSkipLostCommanderMoveEvent';
// Phase 2 is over: both commanders have moved, or been passed over.
export { generateCompleteMoveCommandersPhaseEvent } from './generateCompleteMoveCommandersPhaseEvent';
// Phase 3 is over: orders are carried out, and the engaged spaces recorded.
export { generateCompleteIssueCommandsPhaseEvent } from './generateCompleteIssueCommandsPhaseEvent';
// Phase 4 is over: every engagement has been fought.
export { generateCompleteResolveMeleePhaseEvent } from './generateCompleteResolveMeleePhaseEvent';
// The round is over, or setup is, and the next round begins.
export { generateRoundEndEvent } from './generateRoundEndEvent';
