// The attack-apply an attack leaves behind, with each outcome due or bypassed.
export { createAttackApplyState } from './createAttackApplyState';

// A rout and a retreat as they open, owing what the rules say is owed.
// TODO(misleading): this line heads every opened substep below, not only the
// rout and retreat: engagement and its three kinds, reverse, rally and melee
// too. Settled by widening it, or by a line per group.
export { createOpenedRoutState } from './createOpenedRoutState';
export { createOpenedEngagementState } from './createOpenedEngagementState';
export { createOpenedFlankEngagementResolutionState } from './createOpenedFlankEngagementResolutionState';
export { createOpenedFrontEngagementResolutionState } from './createOpenedFrontEngagementResolutionState';
export { createOpenedRearEngagementResolutionState } from './createOpenedRearEngagementResolutionState';
export { createOpenedReverseState } from './createOpenedReverseState';
export { createOpenedRallyResolutionState } from './createOpenedRallyResolutionState';
export { createOpenedMeleeResolutionState } from './createOpenedMeleeResolutionState';
export { createOpenedRetreatState } from './createOpenedRetreatState';
