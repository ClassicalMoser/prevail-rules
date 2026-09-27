// Current phase, step, initiative, and the round event stream.
export { getCurrentEventStream } from './getCurrentEventStream';
export { getCurrentInitiative } from './getCurrentInitiative';
export { getCurrentStep } from './getCurrentStep';
export { getNextEventNumber } from './getNextEventNumber';
export {
  getCleanupPhaseState,
  getCurrentPhaseState,
  getIssueCommandsPhaseState,
  getMoveCommandersPhaseState,
  getPlayCardsPhaseState,
  getResolveMeleePhaseState,
} from './getPhaseState';

// Issue-commands resolution: movement or ranged attack.
export {
  getCurrentCommandResolutionState,
  getMovementResolutionState,
  getRangedAttackResolutionState,
} from './commandResolution';

// Resolve-melee resolution.
export {
  getMeleeResolutionReadyForAttackCalculation,
  getMeleeResolutionState,
  getRemainingMeleeEngagements,
} from './meleeResolution';

// Cleanup rally.
export {
  getCurrentRallyResolutionState,
  getNextStepForResolveRally,
  getRallyResolutionState,
  getRallyResolutionStateAwaitingBurn,
  getRallyResolutionStateAwaitingUnitSupport,
  getRallyResolutionStateForCurrentStep,
  getRoutStateFromCleanupPhaseForResolveRout,
  getRoutStateFromRally,
} from './rallyResolution';

// Retreat, reverse, rout, and attack-apply.
export {
  canReverseUnit,
  findRetreatState,
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getAwaitingRoutDiscardState,
  getDefendingPlayerForNextIncompleteMeleeAttackApply,
  getRetreatStateFromAttackApply,
  getRetreatStateFromFrontEngagement,
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
  getRetreatStateReadyForResolveFromMelee,
  getReverseStateFromAttackApply,
  getReverseStateFromMeleeResolutionByInitiative,
  getRoutStateFromAttackApply,
  getRoutStateFromMeleeResolutionByInitiative,
  getRoutStateFromRearEngagement,
} from './combatOutcomes';
