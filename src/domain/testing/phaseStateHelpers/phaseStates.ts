import type {
  CleanupPhaseState,
  IssueCommandsPhaseState,
  MoveCommandersPhaseState,
  PlayCardsPhaseState,
  StandardGameState,
  StandardResolveMeleePhaseState,
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
  state: StandardGameState,
  overrides?: Partial<IssueCommandsPhaseState>,
): IssueCommandsPhaseState {
  return {
    phase: ISSUE_COMMANDS_PHASE,
    step: 'firstPlayerResolveCommands',
    remainingCommandsFirstPlayer: new Set(),
    remainingUnitsFirstPlayer: new Set(),
    remainingCommandsSecondPlayer: new Set(),
    remainingUnitsSecondPlayer: new Set(),
    currentCommandResolutionState: undefined,
    ...overrides,
  };
}

/**
 * Creates a ResolveMeleePhaseState with sensible defaults.
 */
export function createResolveMeleePhaseState(
  state: StandardGameState,
  overrides?: Partial<StandardResolveMeleePhaseState>,
): StandardResolveMeleePhaseState {
  return {
    phase: RESOLVE_MELEE_PHASE,
    boardType: 'standard' as const,
    step: 'resolveMelee',
    currentMeleeResolutionState: createMeleeResolutionState(state),
    remainingEngagements: new Set(),
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
    phase: 'cleanup' as const,
    step: 'discardPlayedCards',
    firstPlayerRallyResolutionState: undefined,
    secondPlayerRallyResolutionState: undefined,
    ...overrides,
  };
}
