import type { Board, GameState, PlayerSide } from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';
import { getCleanupPhaseState } from './getPhaseState';
import { getIssueCommandsPhaseState } from './getPhaseState';
import { getMoveCommandersPhaseState } from './getPhaseState';

/**
 * Gets the active player for the current move commanders phase step.
 * Returns the player who should be providing a moveCommander choice.
 *
 * @param state - The game state (must be in moveCommanders phase)
 * @returns The active player for the current step
 * @throws Error if the current step has no active player (e.g. 'complete')
 */
export function getActivePlayerForMoveCommandersStep<TBoard extends Board>(
  state: GameState<TBoard>,
): PlayerSide {
  const phaseState = getMoveCommandersPhaseState(state);
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  switch (phaseState.step) {
    case 'moveFirstCommander':
      return firstPlayer;
    case 'moveSecondCommander':
      return secondPlayer;
    case 'complete':
      throw new Error(
        'No active player for moveCommanders complete step',
      );
    default: {
      const _exhaustive: never = phaseState.step;
      throw new Error(
        `Invalid moveCommanders phase step: ${_exhaustive}`,
      );
    }
  }
}

/**
 * Gets the active player for the current cleanup phase step.
 * Works for chooseRally and resolveRally steps.
 *
 * @param state - The game state (must be in cleanup phase)
 * @returns The active player for the current step
 * @throws Error if the current step has no active player (e.g. 'discardPlayedCards', 'complete')
 */
export function getActivePlayerForCleanupStep<TBoard extends Board>(
  state: GameState<TBoard>,
): PlayerSide {
  const phaseState = getCleanupPhaseState(state);
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  switch (phaseState.step) {
    case 'firstPlayerChooseRally':
    case 'firstPlayerResolveRally':
      return firstPlayer;
    case 'secondPlayerChooseRally':
    case 'secondPlayerResolveRally':
      return secondPlayer;
    case 'discardPlayedCards':
    case 'complete':
      throw new Error(
        `No active player for cleanup ${phaseState.step} step`,
      );
    default: {
      const _exhaustive: never = phaseState.step;
      throw new Error(`Invalid cleanup phase step: ${_exhaustive}`);
    }
  }
}

/**
 * Gets the active player for the current issue commands phase step.
 *
 * @param state - The game state (must be in issueCommands phase)
 * @returns The active player for the current step
 * @throws Error if the current step has no active player (e.g. 'complete')
 */
export function getActivePlayerForIssueCommandsStep<TBoard extends Board>(
  state: GameState<TBoard>,
): PlayerSide {
  const phaseState = getIssueCommandsPhaseState(state);
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  switch (phaseState.step) {
    case 'firstPlayerIssueCommands':
    case 'firstPlayerResolveCommands':
      return firstPlayer;
    case 'secondPlayerIssueCommands':
    case 'secondPlayerResolveCommands':
      return secondPlayer;
    case 'complete':
      throw new Error(
        'No active player for issueCommands complete step',
      );
    default: {
      const _exhaustive: never = phaseState.step;
      throw new Error(
        `Invalid issueCommands phase step: ${_exhaustive}`,
      );
    }
  }
}
