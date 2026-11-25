// The whole round replaced: a new round, or the round's record growing.
export { updateRoundState } from './updateRoundState';
// The phase the round is in replaced.
export { updatePhaseState } from './updatePhaseState';
// A phase brought to its end.
export { markPhaseAsComplete } from './markPhaseAsComplete';
// An ended phase recorded among those ended this round.
export { addCompletedPhase } from './addCompletedPhase';
// The side holding the initiative, and so acting first, this round.
export { updateCurrentInitiative } from './updateCurrentInitiative';
// The side that has prevailed, once the battle is over.
export { updateWinner } from './updateWinner';
