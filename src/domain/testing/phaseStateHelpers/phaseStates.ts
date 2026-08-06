import type {
  CleanupPhaseState,
  GameState,
  IssueCommandsPhaseState,
  MoveCommandersPhaseState,
  PlayCardsPhaseState,
  ResolveMeleePhaseState,
} from '@game';
import {
  ISSUE_COMMANDS_PHASE,
  MOVE_COMMANDERS_PHASE,
  PLAY_CARDS_PHASE,
  RESOLVE_MELEE_PHASE,
} from '@game';

import { createMeleeResolutionState } from './commandResolutionStates';

/**
 * Creates a PlayCardsPhaseState with sensible defaults.
 */
export function createPlayCardsPhaseState(
  overrides?: Partial<PlayCardsPhaseState>,
): PlayCardsPhaseState {
  return {
    phase: PLAY_CARDS_PHASE,
    step: 'chooseCards',
    ...overrides,
  };
}

/**
 * Creates a MoveCommandersPhaseState with sensible defaults.
 */
export function createMoveCommandersPhaseState(
  overrides?: Partial<MoveCommandersPhaseState>,
): MoveCommandersPhaseState {
  return {
    phase: MOVE_COMMANDERS_PHASE,
    step: 'moveFirstCommander',
    ...overrides,
  };
}

/**
 * Creates an IssueCommandsPhaseState with sensible defaults.
 */
export function createIssueCommandsPhaseState(
  _state: GameState,
  overrides?: Partial<IssueCommandsPhaseState>,
): IssueCommandsPhaseState {
  return {
    currentCommandResolutionState: 'pending',
    phase: ISSUE_COMMANDS_PHASE,
    remainingCommandsFirstPlayer: [],
    remainingCommandsSecondPlayer: [],
    remainingUnitsFirstPlayer: [],
    remainingUnitsSecondPlayer: [],
    step: 'firstPlayerResolveCommands',
    ...overrides,
  };
}

/**
 * Creates a ResolveMeleePhaseState with sensible defaults.
 */
export function createResolveMeleePhaseState(
  state: GameState,
  overrides?: Partial<ResolveMeleePhaseState>,
): ResolveMeleePhaseState {
  return {
    currentMeleeResolutionState: createMeleeResolutionState(state),
    phase: RESOLVE_MELEE_PHASE,
    remainingEngagements: [],
    step: 'resolveMelee',
    ...overrides,
  };
}

/**
 * Creates a CleanupPhaseState with sensible defaults.
 */
export function createCleanupPhaseState(
  overrides?: Partial<CleanupPhaseState>,
): CleanupPhaseState {
  return {
    firstPlayerRallyResolutionState: 'pending',
    phase: 'cleanup' as const,
    secondPlayerRallyResolutionState: 'pending',
    step: 'discardPlayedCards',
    ...overrides,
  };
}
