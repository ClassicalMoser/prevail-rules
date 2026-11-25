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
 * Phase 5 (§4.5): the cards in play go to the played piles, then the first
 * player decides whether to rally and carries it out, then the second does
 * the same, and the round ends.
 *
 * @param state - The current game state with Cleanup phase
 * @returns Information about what event is expected
 */
export function getExpectedCleanupPhaseEvent(
  state: GameState,
): ExpectedEventInfo {
  // Asked only in Phase 5; any other phase throws in the getter.
  const phaseState = getCleanupPhaseState(state);

  switch (phaseState.step) {
    case 'cardsLeavePlay': {
      // Both cards in play go to their owners' played piles first (§4.5.1),
      // so a rally that follows has this round's card to burn (§10.3.3).
      const cardsLeavePlay: ExpectedEventInfo = {
        actionType: 'gameEffect',
        effectType: 'cardsLeavePlay',
      };
      return cardsLeavePlay;
    }

    case 'firstPlayerChooseRally':
    case 'secondPlayerChooseRally': {
      // Each player decides whether to rally on their own step (§10.3).
      // The step says whose it is: the first player's, then the second's.
      const rallyingPlayer = getRallyingPlayer(state);
      const chooseRally: ExpectedEventInfo = {
        actionType: 'playerChoice',
        choiceType: 'chooseRally',
        playerSource: rallyingPlayer,
      };
      return chooseRally;
    }

    case 'firstPlayerResolveRally':
    case 'secondPlayerResolveRally': {
      // The rallying player's own rally, whichever of the two it is.
      // It is finished, support check and Morale included, before the next
      // player decides (§10.3.6); what it owes next is the burn and the
      // return, then the support assignment, then any rout it causes.
      const rally = getCurrentRallyResolutionState(state);
      const rallyingPlayer = getRallyingPlayer(state);
      const rallyStep = getExpectedRallyResolutionEvent(rally, rallyingPlayer);
      return rallyStep;
    }

    case 'complete': {
      // Both players have rallied or declined, so the round ends (§4.5.4) and
      // the next begins at Phase 1.
      const endRound: ExpectedEventInfo = {
        actionType: 'gameEffect',
        effectType: 'roundEnd',
      };
      return endRound;
    }

    default: {
      // A step this phase does not have is a fault in the state.
      const _exhaustive: never = phaseState.step;
      throw new Error(`Invalid cleanup phase step: ${_exhaustive}`);
    }
  }
}
