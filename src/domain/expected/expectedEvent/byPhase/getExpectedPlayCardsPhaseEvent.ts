import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getPlayCardsPhaseState, haveBothPlayersChosenCards } from '@queries';

/**
 * Gets information about the expected event for the PlayCards phase.
 *
 * @param state - The current game state with PlayCards phase
 * @returns Information about what event is expected
 */
export function getExpectedPlayCardsPhaseEvent(
  state: GameState,
): ExpectedEventInfo {
  const phaseState = getPlayCardsPhaseState(state);

  switch (phaseState.step) {
    case 'chooseCards': {
      // With both cards face down, they are revealed together (§4.1.2).
      if (haveBothPlayersChosenCards(state.cardState)) {
        return {
          actionType: 'gameEffect',
          effectType: 'revealCards',
        };
      }
      const blackCardChosen = state.cardState.black.awaitingPlay !== null;
      const whiteCardChosen = state.cardState.white.awaitingPlay !== null;
      const oneCardChosen = blackCardChosen || whiteCardChosen;
      if (oneCardChosen) {
        return {
          actionType: 'playerChoice',
          choiceType: 'chooseCard',
          playerSource: blackCardChosen ? 'white' : 'black',
        };
      }
      return {
        actionType: 'playerChoice',
        choiceType: 'chooseCard',
        playerSource: 'bothPlayers',
      };
    }

    case 'assignInitiative': {
      return {
        actionType: 'gameEffect',
        effectType: 'resolveInitiative',
      };
    }

    case 'complete': {
      return {
        actionType: 'gameEffect',
        effectType: 'completePlayCardsPhase',
      };
    }

    default: {
      const _exhaustive: never = phaseState.step;
      throw new Error(`Invalid playCards phase step: ${_exhaustive}`);
    }
  }
}
