import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getMoveCommandersPhaseState, getOtherPlayer } from '@queries';

/**
 * Gets information about the expected event for the MoveCommanders phase.
 *
 * @param state - The current game state with MoveCommanders phase
 * @returns Information about what event is expected
 */
export function getExpectedMoveCommandersPhaseEvent(
  state: GameState,
): ExpectedEventInfo {
  const phaseState = getMoveCommandersPhaseState(state);
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  switch (phaseState.step) {
    case 'moveFirstCommander': {
      // A player whose commander has fallen has nothing to move (§4.2.8).
      if (state.lostCommanders.includes(firstPlayer)) {
        return {
          actionType: 'gameEffect',
          effectType: 'skipLostCommanderMove',
        };
      }
      return {
        actionType: 'playerChoice',
        choiceType: 'moveCommander',
        playerSource: firstPlayer,
      };
    }

    case 'moveSecondCommander': {
      // A player whose commander has fallen has nothing to move (§4.2.8).
      if (state.lostCommanders.includes(secondPlayer)) {
        return {
          actionType: 'gameEffect',
          effectType: 'skipLostCommanderMove',
        };
      }
      return {
        actionType: 'playerChoice',
        choiceType: 'moveCommander',
        playerSource: secondPlayer,
      };
    }

    case 'complete': {
      return {
        actionType: 'gameEffect',
        effectType: 'completeMoveCommandersPhase',
      };
    }

    default: {
      const _exhaustive: never = phaseState.step;
      throw new Error(`Invalid moveCommanders phase step: ${_exhaustive}`);
    }
  }
}
