export { updateAttackApplyState } from './updateAttackApplyState';
export { updateCommandResolutionState } from './updateCommandResolutionState';
export { updateEngagementStateInMovement } from './updateEngagementStateInMovement';

// Ends a rear engagement once its rout is paid, or had nothing to pay.
export { closeRearEngagementWhenRouted } from './closeRearEngagementWhenRouted';
export { updateMeleeAttackApplyState } from './updateMeleeAttackApplyState';
export { updateMeleeResolutionState } from './updateMeleeResolutionState';
export { updateRetreatRoutState } from './updateRetreatRoutState';
export { updateRetreatState } from './updateRetreatState';
export { updateReverseState } from './updateReverseState';
// One player's rally, written to the slot their initiative gives it.
export { updateRallyResolutionState } from './updateRallyResolutionState';

// The cleanup step.
export { updateCleanupStep } from './updateCleanupStep';

// Phase 3, by player: the orders and units still to go, the step, and the
// one unit's move or shot under way.
export { updateRemainingCommandsForPlayer } from './updateRemainingCommandsForPlayer';
export { updateRemainingUnitsForPlayer } from './updateRemainingUnitsForPlayer';
export { updateIssueCommandsStep } from './updateIssueCommandsStep';
export { openCommandResolution } from './openCommandResolution';
export { clearCommandResolution } from './clearCommandResolution';

// An engagement under way, by kind, and its finishing.
export { updateFrontEngagementResolutionState } from './updateFrontEngagementResolutionState';
export { updateFlankEngagementResolutionState } from './updateFlankEngagementResolutionState';
export { updateRearEngagementResolutionState } from './updateRearEngagementResolutionState';
export { completeEngagementInMovement } from './completeEngagementInMovement';

// Phase 4: the melee under way, and the commander moves' step.
export { openMeleeResolution } from './openMeleeResolution';
export { clearMeleeResolution } from './clearMeleeResolution';
export { updateMoveCommandersStep } from './updateMoveCommandersStep';

// A player starts carrying out their orders, and finishes them.
export { beginResolvingCommands } from './beginResolvingCommands';
export { finishResolvingCommands } from './finishResolvingCommands';
export { updateRoutState } from './updateRoutState';
