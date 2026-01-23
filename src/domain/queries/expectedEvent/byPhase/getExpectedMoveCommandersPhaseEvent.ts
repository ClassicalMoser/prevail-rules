import type { Board, ExpectedEventInfo, GameState } from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';
import { getMoveCommandersPhaseState } from '@queries/sequencing';

/**
 * Gets information about the expected event for the MoveCommanders phase.
 *
 * @param state - The current game state with MoveCommanders phase
 * @returns Information about what event is expected
 */
export function getExpectedMoveCommandersPhaseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ExpectedEventInfo<TBoard> {
  const phaseState = getMoveCommandersPhaseState(state);
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  switch (phaseState.step) {
    case 'moveFirstCommander':
      return {
        actionType: 'playerChoice',
        playerSource: firstPlayer,
        choiceType: 'moveCommander',
      };

    case 'moveSecondCommander':
      return {
        actionType: 'playerChoice',
        playerSource: secondPlayer,
        choiceType: 'moveCommander',
      };

    case 'complete':
      return {
        actionType: 'gameEffect',
        effectType: 'completeMoveCommandersPhase',
      };

    default:
      throw new Error(`Invalid moveCommanders phase step: ${phaseState.step}`);
  }
}
