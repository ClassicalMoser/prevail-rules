// The phase in progress. A named getter throws unless that phase is current.
export { getCurrentPhaseState } from './phases';
export { getPlayCardsPhaseState } from './phases';
export { getMoveCommandersPhaseState } from './phases';
export { getMoveCommandersStepFrom } from './phases';
export { getIssueCommandsPhaseState } from './phases';
export { getResolveMeleePhaseState } from './phases';
export { getCleanupPhaseState } from './phases';

// The step of that phase.
export { getCurrentStep } from './getCurrentStep';

// Which side holds initiative.
export { getCurrentInitiative } from './getCurrentInitiative';

// Events applied so far this round.
export { getCurrentEventStream } from './getCurrentEventStream';

// The index the next event will take in that stream.

// The command resolution in progress.
export { getCurrentCommandResolutionState } from './commandResolution';

// That resolution when the command is a movement.
export { getMovementResolutionState } from './commandResolution';

// That resolution when the command is a ranged attack.
export { getRangedAttackResolutionState } from './commandResolution';

// The melee currently being resolved.
export { getMeleeAppliesInResolutionOrder } from './meleeResolution';
export { getMeleeResolutionState } from './meleeResolution';

// Both commitments are done, and attack-apply has not opened yet.
export { getMeleeResolutionReadyForAttackCalculation } from './meleeResolution';

// Spaces still waiting for a melee this phase.
export { getRemainingMeleeEngagements } from './meleeResolution';

// One player's rally during cleanup.
export { getRallyResolutionState } from './rallyResolution';

// The rally for the cleanup step now in progress.
export { getCurrentRallyResolutionState } from './rallyResolution';

// The rally for this resolve step, for the player whose step it is.
export { getRallyResolutionStateForCurrentStep } from './rallyResolution';

// That rally after the player chose to rally, before the burn.
export { getRallyResolutionStateAwaitingBurn } from './rallyResolution';

// That rally after the burn, before support is assigned.
export { getRallyResolutionStateAwaitingUnitSupport } from './rallyResolution';

// The player whose rally the cleanup step is on.
export { getRallyingPlayer } from './rallyResolution';

// Whether this resolve-rally step belongs to the initiative player.
export { getIsFirstPlayerForResolveRallyStep } from './rallyResolution';

// The cleanup step that follows the current resolve-rally step.
export { getNextStepForResolveRally } from './rallyResolution';

// Whether a retreat, reverse, or rout substep has been written.
export { isOpenSubstep } from './combatOutcomes';

// Attack-apply on the current ranged attack.
export { getRangedAttackApplyState } from './combatOutcomes';

// The attack-apply a resolution context names.
export { getAttackApplyStateAt } from './combatOutcomes';
export type { AttackApplyLocation } from './combatOutcomes';

// Attack-apply for one side of the current melee.
export { getMeleeAttackApplyState } from './combatOutcomes';

// The defender whose melee attack-apply is still open, initiative first.
export { findNextMeleeDefendingPlayer } from './combatOutcomes';

// Reverse stored on an attack-apply.
export { getReverseStateFromAttackApply } from './combatOutcomes';

// The reverse still open in the current melee, initiative first.
export { getNextMeleeReverseState } from './combatOutcomes';

// Retreat stored on an attack-apply.
export { getRetreatStateFromAttackApply } from './combatOutcomes';

// Retreat on the current ranged attack.
export { getRangedAttackRetreatState } from './combatOutcomes';

// Retreat for one side of the current melee.
export { getMeleeRetreatState } from './combatOutcomes';

// Rout on the ranged attack's apply, and on one side of the melee's.
export { getRangedAttackRoutState } from './combatOutcomes';
export { getMeleeRoutState } from './combatOutcomes';

// Reverse on the ranged attack's apply, and on one side of the melee's.
export { getRangedAttackReverseState } from './combatOutcomes';
export { getMeleeReverseState } from './combatOutcomes';

// The melee retreat whose destination is chosen and whose move is not finished.
export { findRetreatAwaitingMove } from './combatOutcomes';
export { findRetreatAwaitingRout } from './combatOutcomes';
export { findRetreatLocation } from './combatOutcomes';
export type { RetreatLocation, RetreatSource } from './combatOutcomes';

// Retreat on the current front engagement.
export { getFrontEngagementRetreatState } from './combatOutcomes';

// The retreat for one player, from ranged attack, front engagement, or melee.
export { findRetreatState } from './combatOutcomes';

// That retreat, where a caller knows there is one.
export { getRetreatState } from './combatOutcomes';

// Whether a rout still owes a discard.
export { isAwaitingRoutDiscard } from './combatOutcomes';

// The rout owing a discard, whichever player owes it.
export { findRoutOwingDiscard } from './combatOutcomes';

// The rout whose penalty resolveRout is due to work out.
export { findRoutAwaitingPenalty } from './combatOutcomes';

// This player's rout and the parent accountable for resolving it.
export { findRoutLocation } from './combatOutcomes';
export type { RoutLocation } from './combatOutcomes';

// Just the rout, or undefined when this player is not routing.
export { findRoutState } from './combatOutcomes';

// That rout, where a caller knows there is one.
export { getRoutState } from './combatOutcomes';

// Rout stored on an attack-apply.
export { getRoutStateFromAttackApply } from './combatOutcomes';

// The rout still open in the current melee, initiative first.
export { getNextMeleeRoutState } from './combatOutcomes';

// Rout forced by the current rear engagement.
export { getRearEngagementRoutState } from './combatOutcomes';

// The rout stored on a rally.
export { getRoutStateFromRally } from './combatOutcomes';

// The rout for the cleanup step that is resolving a rally, including choose-rally.
export { getRallyStepRoutState } from './combatOutcomes';
