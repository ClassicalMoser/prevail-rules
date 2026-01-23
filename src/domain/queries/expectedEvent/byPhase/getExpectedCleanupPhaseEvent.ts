import type { Board, ExpectedEventInfo, GameState } from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';
import { getCleanupPhaseState } from '@queries/sequencing';
import { getExpectedRallyResolutionEvent } from '../composable';

/**
 * Gets information about the expected event for the Cleanup phase.
 *
 * @param state - The current game state with Cleanup phase
 * @returns Information about what event is expected
 */
export function getExpectedCleanupPhaseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ExpectedEventInfo<TBoard> {
  const phaseState = getCleanupPhaseState(state);
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  switch (phaseState.step) {
    case 'discardPlayedCards':
      return {
        actionType: 'gameEffect',
        effectType: 'discardPlayedCards',
      };

    case 'firstPlayerChooseRally':
      return {
        actionType: 'playerChoice',
        playerSource: firstPlayer,
        choiceType: 'chooseRally',
      };

    case 'secondPlayerChooseRally':
      return {
        actionType: 'playerChoice',
        playerSource: secondPlayer,
        choiceType: 'chooseRally',
      };

    case 'firstPlayerResolveRally': {
      const rallyState = phaseState.firstPlayerRallyResolutionState;

      if (!rallyState) {
        throw new Error('First player rally resolution state not found');
      }

      return getExpectedRallyResolutionEvent(rallyState);
    }

    case 'secondPlayerResolveRally': {
      const rallyState = phaseState.secondPlayerRallyResolutionState;

      if (!rallyState) {
        throw new Error('Second player rally resolution state not found');
      }

      return getExpectedRallyResolutionEvent(rallyState);
    }

    case 'complete':
      return {
        actionType: 'gameEffect',
        effectType: 'completeCleanupPhase',
      };

    default:
      throw new Error(`Invalid cleanup phase step: ${phaseState.step}`);
  }
}
