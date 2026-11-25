// The attack-apply an attack leaves behind, with each outcome due or bypassed.
export { createAttackApplyState } from './createAttackApplyState';

// Each substep as it opens, owing what the rules say is owed: a rout, an
// engagement and its three kinds, a reverse, a rally, a melee and a retreat.
export { createOpenedRoutState } from './createOpenedRoutState';
export { createOpenedEngagementState } from './createOpenedEngagementState';
export { createOpenedFlankEngagementResolutionState } from './createOpenedFlankEngagementResolutionState';
export { createOpenedFrontEngagementResolutionState } from './createOpenedFrontEngagementResolutionState';
export { createOpenedRearEngagementResolutionState } from './createOpenedRearEngagementResolutionState';
export { createOpenedReverseState } from './createOpenedReverseState';
export { createOpenedRallyResolutionState } from './createOpenedRallyResolutionState';
export { createOpenedMeleeResolutionState } from './createOpenedMeleeResolutionState';
export { createOpenedRetreatState } from './createOpenedRetreatState';
