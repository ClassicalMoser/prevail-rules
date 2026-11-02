// Rout stored on an attack-apply.
export { getRoutStateFromAttackApply } from './getRoutStateFromAttackApply';

// The rout still open in the current melee, initiative first.
export { getRoutStateFromMeleeResolutionByInitiative } from './getRoutStateFromMeleeResolutionByInitiative';

// Rout forced by the current rear engagement.
export { getRoutStateFromRearEngagement } from './getRoutStateFromRearEngagement';

// The rout that still needs a discard, from issue-commands, melee, or cleanup.
export { getAwaitingRoutDiscardState } from './getAwaitingRoutDiscardState';
