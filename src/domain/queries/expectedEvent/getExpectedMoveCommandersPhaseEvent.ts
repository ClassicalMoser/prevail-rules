import type {
  Board,
  ExpectedEventInfo,
  GameState,
  MoveCommandersPhaseState,
  RoundState,
} from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';

/**
 * Gets information about the expected event for the MoveCommanders phase.
 *
 * @param state - The current game state with MoveCommanders phase
 * @returns Information about what event is expected
 */
export function getExpectedMoveCommandersPhaseEvent<TBoard extends Board>(
  state: GameState<TBoard>
): ExpectedEventInfo<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;

  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  if (!phaseState) {
    throw new Error('No current phase state found');
  }

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
