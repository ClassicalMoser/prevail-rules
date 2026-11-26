import type { PlayerSide } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getMoveCommandersPhaseState, getOtherPlayer } from '@queries';

/**
 * One player's turn to move their commander (§4.2.1): they choose where it
 * goes, or the turn is passed over when it has fallen.
 *
 * @param state - The game, on this player's Move Commanders turn
 * @param player - The player whose turn it is
 * @returns Their `moveCommander`, or `skipLostCommanderMove`
 */
function getExpectedCommanderTurnEvent(
  state: GameState,
  player: PlayerSide,
): ExpectedEventInfo {
  // A player whose commander has fallen has nothing to move (§4.2.8).
  if (state.lostCommanders.includes(player)) {
    const passOver: ExpectedEventInfo = {
      actionType: 'gameEffect',
      effectType: 'skipLostCommanderMove',
    };
    return passOver;
  }

  // The commander stands, so its player chooses where it goes: up to four
  // spaces, or nowhere (§4.2.2, §4.2.6).
  const moveCommander: ExpectedEventInfo = {
    actionType: 'playerChoice',
    choiceType: 'moveCommander',
    playerSource: player,
  };
  return moveCommander;
}

/**
 * Gets information about the expected event for the MoveCommanders phase.
 *
 * Phase 2 (§4.2): the first player moves their commander, then the second.
 *
 * @param state - The current game state with MoveCommanders phase
 * @returns Information about what event is expected
 */
export function getExpectedMoveCommandersPhaseEvent(
  state: GameState,
): ExpectedEventInfo {
  // Asked only in Phase 2; any other phase throws in the getter.
  const phaseState = getMoveCommandersPhaseState(state);

  // The player who took the initiative in Phase 1 moves first (§4.1.5).
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  switch (phaseState.step) {
    case 'moveFirstCommander': {
      // The first player's turn.
      const firstTurn = getExpectedCommanderTurnEvent(state, firstPlayer);
      return firstTurn;
    }

    case 'moveSecondCommander': {
      // Then the second player's.
      const secondTurn = getExpectedCommanderTurnEvent(state, secondPlayer);
      return secondTurn;
    }

    case 'complete': {
      // Both turns are taken, so the phase ends and orders are issued next
      // (§4.3).
      const completePhase: ExpectedEventInfo = {
        actionType: 'gameEffect',
        effectType: 'completeMoveCommandersPhase',
      };
      return completePhase;
    }

    default: {
      // A step this phase does not have is a fault in the state.
      const _exhaustive: never = phaseState.step;
      throw new Error(`Invalid moveCommanders phase step: ${_exhaustive}`);
    }
  }
}
