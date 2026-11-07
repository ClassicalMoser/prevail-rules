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

// The melee retreat whose destination is chosen and whose move is not finished.
export { getNextMeleeRetreatStateAwaitingMove } from './getNextMeleeRetreatStateAwaitingMove';

// Routers. The retreat this player is making, wherever it sits.

// `undefined` when they are not retreating.
export { findRetreatState } from './findRetreatState';

// Throws when they are not retreating.
export { getRetreatState } from './getRetreatState';
