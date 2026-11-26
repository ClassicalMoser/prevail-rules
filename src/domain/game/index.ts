// Game record
export { gameSchema } from './game';
export type { Game } from './game';

// The game as one viewer may see it
export {
  authoritativeProjectedGameSchema,
  whiteSeenProjectedGameSchema,
  blackSeenProjectedGameSchema,
  spectatorProjectedGameSchema,
  projectedGameSchema,
} from './game';
export type {
  AuthoritativeProjectedGame,
  WhiteSeenProjectedGame,
  BlackSeenProjectedGame,
  SpectatorProjectedGame,
  ProjectedGame,
} from './game';

// Runtime state
export {
  authoritativeGameStateSchema,
  whiteSeenGameStateSchema,
  blackSeenGameStateSchema,
  spectatorGameStateSchema,
  gameStateSchema,
  gameStateIndexSchema,
} from './gameState';
export type {
  GameStateVisibility,
  AuthoritativeGameState,
  WhiteSeenGameState,
  BlackSeenGameState,
  SpectatorGameState,
  GameState,
  OwnedPlayerForGameState,
  UnownedPlayerForGameState,
  UnitIndexKey,
  UnitIndexEntry,
  CommanderIndexEntry,
  GameStateIndex,
} from './gameState';

// Card piles / visibility
export {
  ownedCardStateSchema,
  hiddenCardStateSchema,
  authoritativeCardStateSchema,
  whiteSeenCardStateSchema,
  blackSeenCardStateSchema,
  spectatorCardStateSchema,
  cardStateSchema,
} from './cardState';
export type {
  OwnedCardState,
  HiddenCardState,
  AuthoritativeCardState,
  WhiteSeenCardState,
  BlackSeenCardState,
  SpectatorCardState,
  CardState,
} from './cardState';

// Round
export { roundStateSchema } from './roundState';
export type { RoundState } from './roundState';

// Phases (play order)
export {
  phases,
  phaseSchema,
  PLAY_CARDS_PHASE,
  MOVE_COMMANDERS_PHASE,
  ISSUE_COMMANDS_PHASE,
  RESOLVE_MELEE_PHASE,
  CLEANUP_PHASE,
  playCardsPhaseSteps,
  playCardsPhaseStateSchema,
  moveCommandersPhaseSteps,
  moveCommandersPhaseStateSchema,
  issueCommandsPhaseSteps,
  issueCommandsPhaseStateSchema,
  resolveMeleePhaseSteps,
  resolveMeleePhaseStateSchema,
  cleanupPhaseSteps,
  cleanupPhaseStateSchema,
  phaseStateSchema,
} from './phases';
export type {
  Phase,
  PlayCardsPhaseStep,
  PlayCardsPhaseState,
  MoveCommandersPhaseStep,
  MoveCommandersPhaseState,
  IssueCommandsPhaseStep,
  IssueCommandsPhaseState,
  ResolveMeleePhaseStep,
  ResolveMeleePhaseState,
  CleanupPhaseStep,
  CleanupPhaseState,
  PhaseState,
} from './phases';
// Steps across phases: each phase's steps by phase, any step, and one value per step
export type { PhaseStepsByPhase, PhaseStep, PhaseStepRecord } from './phases';

// Substeps (command → melee → rally → shared outcomes → engagement)
export {
  commandResolutionStateSchema,
  movementResolutionStateSchema,
  rangedAttackResolutionStateSchema,
  meleeResolutionStateSchema,
  rallyResolutionStateSchema,
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
  AttackApplyState,
  RetreatState,
  RoutState,
  ReverseState,
  EngagementResolutionState,
  EngagementState,
  FlankEngagementResolutionState,
  FlankEngagementState,
  FrontEngagementResolutionState,
  FrontEngagementState,
  RearEngagementResolutionState,
  RearEngagementState,
} from './substeps';
// Any substep play can be inside, and the list of their kinds
export {
  substepTypes,
  substepTypeSchema,
  COMMAND_RESOLUTION_SUBSTEP_TYPE,
  MELEE_RESOLUTION_SUBSTEP_TYPE,
  RALLY_RESOLUTION_SUBSTEP_TYPE,
  ENGAGEMENT_RESOLUTION_SUBSTEP_TYPE,
  ATTACK_APPLY_SUBSTEP_TYPE,
  REVERSE_SUBSTEP_TYPE,
  RETREAT_SUBSTEP_TYPE,
  ROUT_SUBSTEP_TYPE,
} from './substeps';
export type { SubstepState, SubstepType } from './substeps';

// Commitments
export {
  pendingCommitmentSchema,
  declinedCommitmentSchema,
  completedCommitmentSchema,
  commitmentSchema,
} from './commitment';
export type {
  PendingCommitment,
  DeclinedCommitment,
  CompletedCommitment,
  Commitment,
} from './commitment';
