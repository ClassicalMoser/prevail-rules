// Routes. One per parent slot that can hold a retreat: an attack-apply, reached
// through the ranged attack or through either side of the melee, and a front
// engagement where the defender chose to give ground.

// Retreat stored on an attack-apply.
export { getRetreatStateFromAttackApply } from './getRetreatStateFromAttackApply';

// Retreat on the current ranged attack.
export { getRetreatStateFromRangedAttack } from './getRetreatStateFromRangedAttack';

// Retreat for one side of the current melee.
export { getRetreatStateFromMelee } from './getRetreatStateFromMelee';

// Retreat on the current front engagement.
export { getRetreatStateFromFrontEngagement } from './getRetreatStateFromFrontEngagement';

// Selections. A rule of the game decides which candidate is answered about.

// The melee retreat whose destination is chosen and whose move is not finished.
export { getRetreatStateReadyForResolveFromMelee } from './getRetreatStateReadyForResolveFromMelee';

// The retreat for one player, from ranged attack, front engagement, or melee.
export { findRetreatState } from './findRetreatState';
