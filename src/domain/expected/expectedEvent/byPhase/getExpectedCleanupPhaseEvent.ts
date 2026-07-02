import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getCleanupPhaseState, getOtherPlayer } from '@queries';
import { getExpectedRallyResolutionEvent } from '../composable';

/**
 * Gets information about the expected event for the Cleanup phase.
 *
 * @param state - The current game state with Cleanup phase
 * @returns Information about what event is expected
 */
export function getExpectedCleanupPhaseEvent(
  state: GameState,
): ExpectedEventInfo {
  const phaseState = getCleanupPhaseState(state);
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  switch (phaseState.step) {
    case 'discardPlayedCards': {
      return {
        actionType: 'gameEffect',
        effectType: 'discardPlayedCards',
      };
    }

    case 'firstPlayerChooseRally': {
      return {
        actionType: 'playerChoice',
        choiceType: 'chooseRally',
        playerSource: firstPlayer,
      };
    }

    case 'secondPlayerChooseRally': {
      return {
        actionType: 'playerChoice',
        choiceType: 'chooseRally',
        playerSource: secondPlayer,
      };
    }

    case 'firstPlayerResolveRally': {
      const rallyState = phaseState.firstPlayerRallyResolutionState;

      if (rallyState === 'pending') {
        throw new Error('First player rally resolution state not found');
      }

      return getExpectedRallyResolutionEvent(rallyState);
    }

    case 'secondPlayerResolveRally': {
      const rallyState = phaseState.secondPlayerRallyResolutionState;

      if (rallyState === 'pending') {
        throw new Error('Second player rally resolution state not found');
      }

      return getExpectedRallyResolutionEvent(rallyState);
    }

    case 'complete': {
      return {
        actionType: 'gameEffect',
        effectType: 'completeCleanupPhase',
      };
    }

    default: {
      const _exhaustive: never = phaseState.step;
      throw new Error(`Invalid cleanup phase step: ${_exhaustive}`);
    }
  }
}
