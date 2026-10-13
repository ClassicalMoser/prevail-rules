// The phase in progress. A named getter throws unless that phase is current.
export {
  getCurrentPhaseState,
  getPlayCardsPhaseState,
  getMoveCommandersPhaseState,
  getIssueCommandsPhaseState,
  getResolveMeleePhaseState,
  getCleanupPhaseState,
} from './getPhaseState';

// The step of that phase.
export { getCurrentStep } from './getCurrentStep';

// Which side holds initiative.
export { getCurrentInitiative } from './getCurrentInitiative';

// Events applied so far this round.
export { getCurrentEventStream } from './getCurrentEventStream';

// The index the next event will take in that stream.
export { getNextEventNumber } from './getNextEventNumber';

// The command resolution in progress.
export { getCurrentCommandResolutionState } from './commandResolution';

// That resolution when the command is a movement.
export { getMovementResolutionState } from './commandResolution';

// That resolution when the command is a ranged attack.
export { getRangedAttackResolutionState } from './commandResolution';

// The melee currently being resolved.
export { getMeleeResolutionState } from './meleeResolution';

// Both commitments are done, and attack-apply has not opened yet.
export { getMeleeResolutionReadyForAttackCalculation } from './meleeResolution';

// Spaces still waiting for a melee this phase.
export { getRemainingMeleeEngagements } from './meleeResolution';

// One player's rally during cleanup.
export { getRallyResolutionState } from './rallyResolution';

// The rally for the cleanup step now in progress.
export { getCurrentRallyResolutionState } from './rallyResolution';

// The rout stored on a rally.
export { getRoutStateFromRally } from './rallyResolution';

// The rout for the cleanup step that is resolving a rally, including choose-rally.
export { getRoutStateFromCleanupPhaseForResolveRout } from './rallyResolution';

// The rally for this resolve step, for the player whose step it is.
export { getRallyResolutionStateForCurrentStep } from './rallyResolution';

// That rally after the player chose to rally, before the burn.
export { getRallyResolutionStateAwaitingBurn } from './rallyResolution';

// That rally after the burn, before support is assigned.
export { getRallyResolutionStateAwaitingUnitSupport } from './rallyResolution';

// Whether this resolve-rally step belongs to the initiative player.
export { getIsFirstPlayerForResolveRallyStep } from './rallyResolution';

// The cleanup step that follows the current resolve-rally step.
export { getNextStepForResolveRally } from './rallyResolution';

// Attack-apply on the current ranged attack.
export { getAttackApplyStateFromRangedAttack } from './combatOutcomes';

// Attack-apply for one side of the current melee.
export { getAttackApplyStateFromMelee } from './combatOutcomes';

// The defender whose melee attack-apply is still open, initiative first.
export { getDefendingPlayerForNextIncompleteMeleeAttackApply } from './combatOutcomes';

// Reverse stored on an attack-apply.
export { getReverseStateFromAttackApply } from './combatOutcomes';

// The reverse still open in the current melee, initiative first.
export { getReverseStateFromMeleeResolutionByInitiative } from './combatOutcomes';

// Whether that reversing unit is free of the engagement.
export { canReverseUnit } from './combatOutcomes';

// Retreat stored on an attack-apply.
export { getRetreatStateFromAttackApply } from './combatOutcomes';

// Retreat on the current ranged attack.
export { getRetreatStateFromRangedAttack } from './combatOutcomes';

// Retreat for one side of the current melee.
export { getRetreatStateFromMelee } from './combatOutcomes';

// The melee retreat whose destination is chosen and whose move is not finished.
export { getRetreatStateReadyForResolveFromMelee } from './combatOutcomes';

// Retreat on the current front engagement.
export { getRetreatStateFromFrontEngagement } from './combatOutcomes';

// The retreat for one player, from ranged attack, front engagement, or melee.
export { findRetreatState } from './combatOutcomes';

// Rout stored on an attack-apply.
export { getRoutStateFromAttackApply } from './combatOutcomes';

// The rout still open in the current melee, initiative first.
export { getRoutStateFromMeleeResolutionByInitiative } from './combatOutcomes';

// Rout forced by the current rear engagement.
export { getRoutStateFromRearEngagement } from './combatOutcomes';

// The rout that still needs a discard, from issue-commands, melee, or cleanup.
export { getAwaitingRoutDiscardState } from './combatOutcomes';
