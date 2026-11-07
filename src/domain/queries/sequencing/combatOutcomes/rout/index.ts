// Routes. One per parent slot that can hold a rout. The route is the fact: which
// parent's rout this is, and therefore what caused it.
// A retreat with nowhere to go also holds a rout. That slot has no route getter;
// `getExpectedRetreatEvent` reads the field directly to decide whether to open it.

// Rout stored on an attack-apply.
export { getRoutStateFromAttackApply } from './getRoutStateFromAttackApply';

// Rout on the ranged attack's apply.
export { getRangedAttackRoutState } from './getRangedAttackRoutState';

// Rout on one side of the melee's apply.
export { getMeleeRoutState } from './getMeleeRoutState';

// Rout forced by the current rear engagement.
export { getRearEngagementRoutState } from './getRearEngagementRoutState';

// The rout stored on a rally.
export { getRoutStateFromRally } from './getRoutStateFromRally';

// Selections. A rule of the game decides which candidate is answered about, so
// each of these encodes sequencing rather than position.

// The rout still open in the current melee, initiative first.
export { getNextMeleeRoutState } from './getNextMeleeRoutState';

// The rout on the rally for the cleanup step now resolving.
export { getRallyStepRoutState } from './getRallyStepRoutState';

// Whether a rout still owes its owner's discard.
export { isAwaitingRoutDiscard } from './isAwaitingRoutDiscard';

// Selections. Which player's rout a given step is due for.
export { findRoutOwingDiscard } from './findRoutOwingDiscard';
export { findRoutAwaitingPenalty } from './findRoutAwaitingPenalty';

// Routers. This player's rout, wherever it sits.

// The rout and the parent accountable for resolving it. Every layer that has
// to locate a rout descends here.
export { findRoutLocation } from './findRoutLocation';
export type { RoutLocation } from './findRoutLocation';

// Just the rout. `undefined` when this player is not routing.
export { findRoutState } from './findRoutState';

// Throws when this player is not routing.
export { getRoutState } from './getRoutState';
