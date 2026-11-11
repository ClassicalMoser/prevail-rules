// Routes. One per parent slot that can hold a retreat: an attack-apply, reached
// through the ranged attack or through either side of the melee, and a front
// engagement where the defender chose to give ground.

// Retreat stored on an attack-apply.
export { getRetreatStateFromAttackApply } from './getRetreatStateFromAttackApply';

// Retreat on the current ranged attack.
export { getRangedAttackRetreatState } from './getRangedAttackRetreatState';

// Retreat for one side of the current melee.
export { getMeleeRetreatState } from './getMeleeRetreatState';

// Retreat on the current front engagement.
export { getFrontEngagementRetreatState } from './getFrontEngagementRetreatState';

// Selections. A rule of the game decides which candidate is answered about.

// The retreat whose owner has several ways back and has not yet chosen.
export { findRetreatAwaitingChoice } from './findRetreatAwaitingChoice';

// The retreat whose path is settled and whose move is not finished.
export { findRetreatAwaitingMove } from './findRetreatAwaitingMove';

// The retreat with nowhere to go whose rout has not opened.
export { findRetreatAwaitingRout } from './findRetreatAwaitingRout';
export { getRetreatAwaitingRout } from './getRetreatAwaitingRout';

// Routers. The retreat this player is making, wherever it sits.

// With the parent holding it; `undefined` when they are not retreating.
export type { RetreatLocation, RetreatSource } from './findRetreatLocation';
export { findRetreatLocation } from './findRetreatLocation';

// `undefined` when they are not retreating.
export { findRetreatState } from './findRetreatState';

// Throws when they are not retreating.
export { getRetreatState } from './getRetreatState';
