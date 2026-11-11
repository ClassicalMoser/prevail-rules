import type {
  CleanupPhaseState,
  GameState,
  RoutState,
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

import { hasInitiative } from '@queries';

import { createMeleeResolutionState } from './commandResolutionStates';
import { createRallyResolutionState } from './substepStates';

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

/**
 * Cleanup on the routing player's own rally, with that rally accepted and the
 * given rout open on it. The player holding the initiative rallies first, the
 * other second, so the rally goes in that player's slot and the step is that
 * player's resolve step.
 *
 * @param state - The game state, read for who holds the initiative
 * @param routState - The rout the rallying player owes
 * @returns Cleanup on that player's resolve-rally step
 */
export function createCleanupPhaseStateWithRallyRout(
  state: GameState,
  routState: RoutState,
): CleanupPhaseState {
  const rally = createRallyResolutionState({
    playerRallied: true,
    rallyResolved: true,
    routState,
  });
  // The first player rallies first (§4.5.2), the other after.
  const onRally = hasInitiative(state, routState.player)
    ? createCleanupPhaseState({
        firstPlayerRallyResolutionState: rally,
        step: 'firstPlayerResolveRally',
      })
    : createCleanupPhaseState({
        secondPlayerRallyResolutionState: rally,
        step: 'secondPlayerResolveRally',
      });
  return onRally;
}
