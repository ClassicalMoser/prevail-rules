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
// TODO(misleading): the `find` queries here answer `undefined` and the `From`
// readers answer `'bypassed'`; the README names four kinds and the find/get
// split. Settled by matching this to the README.

// Whether a retreat, reverse, or rout substep has been written.
export { isOpenSubstep } from './isOpenSubstep';

// Attack-apply: on the ranged attack, or on either side of a melee.
export { getRangedAttackApplyState } from './attackApply';
export { getMeleeAttackApplyState } from './attackApply';
export { getAttackApplyStateAt } from './attackApply';
export type { AttackApplyLocation } from './attackApply';
export { findNextMeleeDefendingPlayer } from './attackApply';

// Retreat: on an attack-apply, or on a front engagement.
export { getRetreatStateFromAttackApply } from './retreat';
export { getRangedAttackRetreatState } from './retreat';
export { getMeleeRetreatState } from './retreat';
export { getFrontEngagementRetreatState } from './retreat';
export { findRetreatAwaitingMove } from './retreat';
export { findRetreatAwaitingRout } from './retreat';
export { findRetreatLocation } from './retreat';
export type { RetreatLocation, RetreatSource } from './retreat';
export { findRetreatState } from './retreat';
export { getRetreatState } from './retreat';

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
export { isAwaitingRoutDiscard } from './rout';
export { findRoutOwingDiscard } from './rout';
export { findRoutAwaitingPenalty } from './rout';
export { findRoutLocation } from './rout';
export type { RoutLocation } from './rout';
export { findRoutState } from './rout';
export { getRoutState } from './rout';
