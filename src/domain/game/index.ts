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
  phaseSchema,
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

// Substeps (command → melee → rally → shared outcomes → engagement)
export {
  commandResolutionStateSchema,
  movementResolutionStateSchema,
  rangedAttackResolutionStateSchema,
  meleeResolutionStateSchema,
  rallyResolutionStateSchema,
  attackResultSchema,
  attackApplyStateSchema,
  retreatStateSchema,
  routStateSchema,
  reverseStateSchema,
  engagementResolutionStateSchema,
  engagementStateSchema,
  flankEngagementResolutionStateSchema,
  frontEngagementResolutionStateSchema,
  rearEngagementResolutionStateSchema,
} from './substeps';
export type {
  CommandResolutionState,
  MovementResolutionState,
  RangedAttackResolutionState,
  MeleeResolutionState,
  RallyResolutionState,
  AttackResult,
  AttackApplyState,
  RetreatState,
  RoutState,
  ReverseState,
  EngagementResolutionState,
  EngagementState,
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  RearEngagementResolutionState,
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

// Type guards
export { isAuthoritativeGameState } from './typeGuards';
