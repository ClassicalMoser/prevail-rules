// Retreat stored on an attack-apply.
export { getRetreatStateFromAttackApply } from './getRetreatStateFromAttackApply';

// Retreat on the current ranged attack.
export { getRetreatStateFromRangedAttack } from './getRetreatStateFromRangedAttack';

// Retreat for one side of the current melee.
export { getRetreatStateFromMelee } from './getRetreatStateFromMelee';

// The melee retreat whose destination is chosen and whose move is not finished.
export { getRetreatStateReadyForResolveFromMelee } from './getRetreatStateReadyForResolveFromMelee';

// Retreat on the current front engagement.
export { getRetreatStateFromFrontEngagement } from './getRetreatStateFromFrontEngagement';

// The retreat for one player, from ranged attack, front engagement, or melee.
export { findRetreatState } from './findRetreatState';
