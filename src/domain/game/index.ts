// Game record
export {
  authoritativeGameSchema,
  blackSeenGameSchema,
  gameSchema,
  whiteSeenGameSchema,
} from './game';
export type { Game, GameForVisibility } from './game';

// Runtime state
export { gameStateSchema } from './gameState';
export type {
  CardStateForVisibility,
  GameState,
  GameStateForVisibility,
  GameStateVisibility,
  OwnedPlayerForGameState,
  UnownedPlayerForGameState,
} from './gameState';

// Card piles / visibility
export {
  authoritativeCardStateSchema,
  blackSeenCardStateSchema,
  cardStateSchema,
  hiddenCardStateSchema,
  ownedCardStateSchema,
  whiteSeenCardStateSchema,
} from './cardState';
export type {
  AuthoritativeCardState,
  BlackSeenCardState,
  CardState,
  HiddenCardState,
  OwnedCardState,
  WhiteSeenCardState,
} from './cardState';

// Round
export { roundStateSchema } from './roundState';
export type { RoundState } from './roundState';

// Phases (play order)
export {
  CLEANUP_PHASE,
  ISSUE_COMMANDS_PHASE,
  MOVE_COMMANDERS_PHASE,
  PLAY_CARDS_PHASE,
  RESOLVE_MELEE_PHASE,
  cleanupPhaseStateSchema,
  cleanupPhaseSteps,
  issueCommandsPhaseStateSchema,
  issueCommandsPhaseSteps,
  moveCommandersPhaseStateSchema,
  moveCommandersPhaseSteps,
  phases,
  phaseStateSchema,
  playCardsPhaseStateSchema,
  playCardsPhaseSteps,
  resolveMeleePhaseStateSchema,
  resolveMeleePhaseSteps,
} from './phases';
export type {
  CleanupPhaseState,
  CleanupPhaseStep,
  IssueCommandsPhaseState,
  IssueCommandsPhaseStep,
  MoveCommandersPhaseState,
  MoveCommandersPhaseStep,
  Phase,
  PhaseState,
  PlayCardsPhaseState,
  PlayCardsPhaseStep,
  ResolveMeleePhaseState,
  ResolveMeleePhaseStep,
} from './phases';

// Substeps
export {
  attackApplyStateSchema,
  commandResolutionStateSchema,
  engagementResolutionStateSchema,
  engagementStateSchema,
  flankEngagementResolutionStateSchema,
  frontEngagementResolutionStateSchema,
  meleeResolutionStateSchema,
  movementResolutionStateSchema,
  rallyResolutionStateSchema,
  rangedAttackResolutionStateSchema,
  rearEngagementResolutionStateSchema,
  retreatStateSchema,
  reverseStateSchema,
  routStateSchema,
} from './substeps';
export type {
  AttackApplyState,
  CommandResolutionState,
  EngagementResolutionState,
  EngagementState,
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  MeleeResolutionState,
  MovementResolutionState,
  RallyResolutionState,
  RangedAttackResolutionState,
  RearEngagementResolutionState,
  RetreatState,
  ReverseState,
  RoutState,
} from './substeps';

// Commitments
export {
  commitmentSchema,
  completedCommitmentSchema,
  declinedCommitmentSchema,
  pendingCommitmentSchema,
} from './commitment';
export type {
  Commitment,
  CompletedCommitment,
  DeclinedCommitment,
  PendingCommitment,
} from './commitment';

// Attack results
export { attackResultSchema } from './attackResult';
export type { AttackResult } from './attackResult';

// Type guards
export { isAuthoritativeGameState } from './typeGuards';
