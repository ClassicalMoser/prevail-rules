// Each phase as it opens, to put in a game with `updatePhaseState`.
export { createPlayCardsPhaseState } from './playCardsPhaseState';
export { createMoveCommandersPhaseState } from './moveCommandersPhaseState';
export { createIssueCommandsPhaseState } from './issueCommandsPhaseState';
export { createResolveMeleePhaseState } from './resolveMeleePhaseState';
export { createCleanupPhaseState } from './cleanupPhaseState';

// Cleanup on one player's rally, with the rout that rally caused open.
export { createCleanupPhaseStateWithRallyRout } from './cleanupPhaseStateWithRallyRout';

// The order or melee under way, with its commitments already made.
export { createMovementResolutionState } from './movementResolutionState';
export { createRangedAttackResolutionState } from './rangedAttackResolutionState';
export { createMeleeResolutionState } from './meleeResolutionState';

// The engagement a move walked into: head on, in the flank, or from behind.
export { createFrontEngagementState } from './frontEngagementState';
export { createFlankEngagementState } from './flankEngagementState';
export { createRearEngagementState } from './rearEngagementState';

// What an attack did to its target, with the step its name promises open.
export { createAttackApplyStateWithNothingDue } from './attackApplyStateWithNothingDue';
export { createAttackApplyStateWithRetreat } from './attackApplyStateWithRetreat';
export { createAttackApplyStateWithRetreatAndReverse } from './attackApplyStateWithRetreatAndReverse';
export { createAttackApplyStateWithReverse } from './attackApplyStateWithReverse';
export { createAttackApplyStateWithRout } from './attackApplyStateWithRout';

// The steps an attack or a rally opens: retreat, reverse, rout, the rally itself.
export { createRetreatState } from './retreatState';
export { createReverseState } from './reverseState';
export { createRoutState } from './routState';
export { createRallyResolutionState } from './rallyResolutionState';

// A whole game in Phase 3 or 4, around an order or a melee a spec built.
export { createGameStateResolvingCommand } from './gameStateResolvingCommand';
export { createGameStateMovingInto } from './gameStateMovingInto';
export { createGameStateResolvingMelee } from './gameStateResolvingMelee';
