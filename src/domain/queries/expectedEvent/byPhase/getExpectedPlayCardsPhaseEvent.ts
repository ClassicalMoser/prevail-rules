import type { Board, ExpectedEventInfo, GameState } from '@entities';
import { getPlayCardsPhaseState } from '@queries/sequencing';

/**
 * Gets information about the expected event for the PlayCards phase.
 *
 * @param state - The current game state with PlayCards phase
 * @returns Information about what event is expected
 */
export function getExpectedPlayCardsPhaseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ExpectedEventInfo<TBoard> {
  const phaseState = getPlayCardsPhaseState(state);

  switch (phaseState.step) {
    case 'chooseCards': {
      const blackCardChosen = state.cardState.black.awaitingPlay !== null;
      const whiteCardChosen = state.cardState.white.awaitingPlay !== null;
      const oneCardChosen = blackCardChosen || whiteCardChosen;
      if (oneCardChosen) {
        return {
          actionType: 'playerChoice',
          playerSource: blackCardChosen ? 'white' : 'black',
          choiceType: 'chooseCard',
        };
      }
      return {
        actionType: 'playerChoice',
        playerSource: 'bothPlayers',
        choiceType: 'chooseCard',
      };
    }
    case 'revealCards':
      return {
        actionType: 'gameEffect',
        effectType: 'revealCards',
      };

    case 'assignInitiative':
      return {
        actionType: 'gameEffect',
        effectType: 'resolveInitiative',
      };

    case 'complete':
      return {
        actionType: 'gameEffect',
        effectType: 'completePlayCardsPhase',
      };

    default:
      throw new Error(`Invalid playCards phase step: ${phaseState.step}`);
  }
}
