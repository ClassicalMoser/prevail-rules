// Round 0: each side places its whole army, then the round ends.
export { getExpectedSetupEvent } from './getExpectedSetupEvent';
// Phase 1: both choose a card face down, the reveal, then initiative.
export { getExpectedPlayCardsPhaseEvent } from './getExpectedPlayCardsPhaseEvent';
// Phase 2: each commander moves in turn, or its fallen turn is passed over.
export { getExpectedMoveCommandersPhaseEvent } from './getExpectedMoveCommandersPhaseEvent';
// Phase 3: each player issues their orders, then carries them out.
export { getExpectedIssueCommandsPhaseEvent } from './getExpectedIssueCommandsPhaseEvent';
// Phase 4: every engagement fights, in the order the first player chooses.
export { getExpectedResolveMeleePhaseEvent } from './getExpectedResolveMeleePhaseEvent';
// Phase 5: cards leave play, each player's rally, then the round ends.
export { getExpectedCleanupPhaseEvent } from './getExpectedCleanupPhaseEvent';
