// The three outcome substeps and the parents that hold them. Which parent a slot
// belongs to is part of what the query answers, so there is one getter per parent
// rather than one getter with a parent argument. [`README.md`](./README.md) has
// the map.
//
// Within each substep, routes come first: they descend to a named parent and read
// its slot. Selections come after: a rule of the game decides which candidate to
// answer about, so those carry sequencing meaning that the routes do not.

// Whether a retreat, reverse, or rout substep has been written.
export { isOpenSubstep } from './isOpenSubstep';

// Attack-apply: on the ranged attack, or on either side of a melee.
export { getAttackApplyStateFromRangedAttack } from './attackApply';
export { getAttackApplyStateFromMelee } from './attackApply';
export { getDefendingPlayerForNextIncompleteMeleeAttackApply } from './attackApply';

// Retreat: on an attack-apply, or on a front engagement.
export { getRetreatStateFromAttackApply } from './retreat';
export { getRetreatStateFromRangedAttack } from './retreat';
export { getRetreatStateFromMelee } from './retreat';
export { getRetreatStateFromFrontEngagement } from './retreat';
export { getRetreatStateReadyForResolveFromMelee } from './retreat';
export { findRetreatState } from './retreat';

// Reverse: on an attack-apply only.
export { getReverseStateFromAttackApply } from './reverse';
export { getReverseStateFromMeleeResolutionByInitiative } from './reverse';

// Rout: on an attack-apply, a rear engagement, a rally, or a retreat.
export { getRoutStateFromAttackApply } from './rout';
export { getRoutStateFromRearEngagement } from './rout';
export { getRoutStateFromRally } from './rout';
export { getRoutStateFromMeleeResolutionByInitiative } from './rout';
export { getRoutStateFromCleanupPhaseForResolveRout } from './rout';
export { getAwaitingRoutDiscardState } from './rout';
