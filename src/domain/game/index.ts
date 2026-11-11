// Game record
export { gameSchema } from './game';
export type { Game } from './game';

// Runtime state
export {
  authoritativeGameStateSchema,
  blackSeenGameStateSchema,
  gameStateSchema,
  spectatorGameStateSchema,
  whiteSeenGameStateSchema,
} from './gameState';
export type {
  AuthoritativeGameState,
  BlackSeenGameState,
  GameState,
  GameStateBase,
  GameStateVisibility,
  OwnedPlayerForGameState,
  SpectatorGameState,
  UnownedPlayerForGameState,
  WhiteSeenGameState,
} from './gameState';

// Card piles / visibility
export {
  authoritativeCardStateSchema,
  blackSeenCardStateSchema,
  cardStateSchema,
  hiddenCardStateSchema,
  ownedCardStateSchema,
  spectatorCardStateSchema,
  whiteSeenCardStateSchema,
} from './cardState';
export type {
  AuthoritativeCardState,
  BlackSeenCardState,
  CardState,
  HiddenCardState,
  OwnedCardState,
  SpectatorCardState,
  WhiteSeenCardState,
} from './cardState';

// Round
export {
  authoritativeRoundStateSchema,
  roundStateSchema,
  seenRoundStateSchema,
} from './roundState';
export type {
  AuthoritativeRoundState,
  RoundState,
  RoundStateBase,
  SeenRoundState,
} from './roundState';

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
