// The three outcome substeps and the parents that hold them. Which parent a slot
// belongs to is part of what the query answers, so there is one getter per
// parent rather than one getter with a parent argument. [`README.md`](./README.md)
// has the map.
//
// Four kinds of query live here; the README says how to tell them apart. A
// **parent reader** takes the parent substate and says `From`; it alone answers
// `'bypassed'`. A **scoped getter** descends from the game state and leads with
// the context it descends into, and throws when that context does not hold what
// it names. A **selection** picks among candidates by a rule of the game and
// says `Next`, or `find` when there may be none. A **router** walks every
// context, takes the player, and answers. Whether a query is total is a
// separate axis: `find` answers `undefined` for an absence, `get` insists and
// throws.

// Whether a retreat, reverse, or rout substep has been written.
export { isOpenSubstep } from './isOpenSubstep';

// Attack-apply: on the ranged attack, or on either side of a melee.
export { getRangedAttackApplyState } from './attackApply';
export { getMeleeAttackApplyState } from './attackApply';
export { getAttackApplyStateAt } from './attackApply';
export type { AttackApplyLocation } from './attackApply';
export {
  findNextMeleeAttackApplyToClose,
  findNextMeleeDefendingPlayer,
} from './attackApply';

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
