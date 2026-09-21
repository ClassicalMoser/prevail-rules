// Play cards
export {
  playCardsPhaseStateSchema,
  playCardsPhaseSteps,
} from './playCardsPhase';
export type { PlayCardsPhaseState, PlayCardsPhaseStep } from './playCardsPhase';

// Move commanders
export {
  moveCommandersPhaseStateSchema,
  moveCommandersPhaseSteps,
} from './moveCommandersPhase';
export type {
  MoveCommandersPhaseState,
  MoveCommandersPhaseStep,
} from './moveCommandersPhase';

// Issue commands
export {
  issueCommandsPhaseStateSchema,
  issueCommandsPhaseSteps,
} from './issueCommandsPhase';
export type {
  IssueCommandsPhaseState,
  IssueCommandsPhaseStep,
} from './issueCommandsPhase';

// Resolve melee
export {
  resolveMeleePhaseStateSchema,
  resolveMeleePhaseSteps,
} from './resolveMeleePhase';
export type {
  ResolveMeleePhaseState,
  ResolveMeleePhaseStep,
} from './resolveMeleePhase';

// Cleanup
export { cleanupPhaseStateSchema, cleanupPhaseSteps } from './cleanupPhase';
export type { CleanupPhaseState, CleanupPhaseStep } from './cleanupPhase';

// Phase catalog + union
export {
  CLEANUP_PHASE,
  ISSUE_COMMANDS_PHASE,
  MOVE_COMMANDERS_PHASE,
  PLAY_CARDS_PHASE,
  RESOLVE_MELEE_PHASE,
  phases,
  phaseSchema,
  phaseStateSchema,
} from './phases';
export type { Phase, PhaseState } from './phases';
