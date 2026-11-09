// Whether stepping into an enemy from this space is a legal engagement:
// always from the flank, from behind only if the move began behind, from the
// front only if it can square up (§6.2).
export { canEngageEnemy } from './canEngageEnemy';

// The facing an engaging move ends on: squared head-on for a front approach,
// as it arrived otherwise (§6.2.3).
export { getEngagementEndFacing } from './getEngagementEndFacing';
