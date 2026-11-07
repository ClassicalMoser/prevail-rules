// The three outcome substeps and the parents that hold them. Which parent a slot
// belongs to is part of what the query answers, so there is one getter per
// parent rather than one getter with a parent argument. [`README.md`](./README.md)
// has the map.
//
// Three kinds of query live here. A **parent reader** takes the parent substate
// and says `From`. A **scoped getter** descends from the game state and leads
// with the context it descends into. A **selection** picks among candidates by a
// rule of the game and says `Next`. All three throw when what they name is
// absent.

// Whether a retreat, reverse, or rout substep has been written.
export { isOpenSubstep } from './isOpenSubstep';

// Attack-apply: on the ranged attack, or on either side of a melee.
export { getRangedAttackApplyState } from './attackApply';
export { getMeleeAttackApplyState } from './attackApply';
export { getNextMeleeDefendingPlayer } from './attackApply';

// Retreat: on an attack-apply, or on a front engagement.
export { getRetreatStateFromAttackApply } from './retreat';
export { getRangedAttackRetreatState } from './retreat';
export { getMeleeRetreatState } from './retreat';
export { getFrontEngagementRetreatState } from './retreat';
export { getNextMeleeRetreatStateAwaitingMove } from './retreat';
export { findRetreatState } from './retreat';

// Reverse: on an attack-apply only.
export { getReverseStateFromAttackApply } from './reverse';
export { getRangedAttackReverseState } from './reverse';
export { getMeleeReverseState } from './reverse';
export { getNextMeleeReverseState } from './reverse';

// Rout: on an attack-apply, a rear engagement, a rally, or a retreat.
export { getRoutStateFromAttackApply } from './rout';
export { getRangedAttackRoutState } from './rout';
export { getMeleeRoutState } from './rout';
export { getRearEngagementRoutState } from './rout';
export { getRoutStateFromRally } from './rout';
export { getNextMeleeRoutState } from './rout';
export { getRallyStepRoutState } from './rout';
export { getAwaitingRoutDiscardState } from './rout';
