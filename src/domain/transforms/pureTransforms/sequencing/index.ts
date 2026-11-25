// The results an attack leaves on its target, in a shot or on either side of
// a melee.
export { updateAttackApplyState } from './updateAttackApplyState';
// The one unit's move or shot under way in Phase 3.
export { updateCommandResolutionState } from './updateCommandResolutionState';
// The engagement a moving unit has walked into.
export { updateEngagementStateInMovement } from './updateEngagementStateInMovement';

// The results on one side of a melee, by whose unit takes them.
export { updateMeleeAttackApplyState } from './updateMeleeAttackApplyState';
// The melee being fought in Phase 4.
export { updateMeleeResolutionState } from './updateMeleeResolutionState';
// The rout of a unit that had to retreat and could not.
export { updateRetreatRoutState } from './updateRetreatRoutState';
// A retreat, wherever it sits: on an attack's results or a front engagement.
export { updateRetreatState } from './updateRetreatState';
// A reverse, on an attack's results.
export { updateReverseState } from './updateReverseState';
// One player's rally, written to the slot their initiative gives it.
export { updateRallyResolutionState } from './updateRallyResolutionState';

// The cleanup step, and the play cards step.
export { updateCleanupStep } from './updateCleanupStep';
export { updatePlayCardsStep } from './updatePlayCardsStep';

// Phase 3, by player: the units still to act, the step, and the one unit's
// move or shot under way.
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
// A rout written where it sits, and once paid, what it held open closed.
export { settleRout } from './settleRout';
// A rout written where it sits, and nothing else.
export { updateRoutState } from './updateRoutState';
