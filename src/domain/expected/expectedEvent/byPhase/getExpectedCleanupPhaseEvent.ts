import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import {
  getCleanupPhaseState,
  getCurrentRallyResolutionState,
  getRallyingPlayer,
} from '@queries';
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

  switch (phaseState.step) {
    case 'discardPlayedCards': {
      return {
        actionType: 'gameEffect',
        effectType: 'discardPlayedCards',
      };
    }

    case 'firstPlayerChooseRally':
    case 'secondPlayerChooseRally': {
      // Each player decides whether to rally on their own step (§10.3).
      return {
        actionType: 'playerChoice',
        choiceType: 'chooseRally',
        playerSource: getRallyingPlayer(state),
      };
    }

    case 'firstPlayerResolveRally':
    case 'secondPlayerResolveRally': {
      // The rallying player's own rally, whichever of the two it is.
      return getExpectedRallyResolutionEvent(
        getCurrentRallyResolutionState(state),
        getRallyingPlayer(state),
      );
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
