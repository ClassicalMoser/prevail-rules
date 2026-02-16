import type { Board, GameState, PlayerSide } from '@entities';
import { getPlayCardsPhaseState } from './getPhaseState';

/**
 * Gets which player(s) still need to choose a card in the play cards phase.
 * Returns `'bothPlayers'` when neither has chosen, or a specific PlayerSide
 * when one player has already chosen and the other hasn't.
 *
 * @param state - The game state (must be in playCards phase, chooseCards step)
 * @returns The player(s) who still need to choose a card
 * @throws Error if not in chooseCards step, or if both players have already chosen
 */
export function getPlayersAwaitingCardChoice<TBoard extends Board>(
  state: GameState<TBoard>,
): PlayerSide | 'bothPlayers' {
  const phaseState = getPlayCardsPhaseState(state);

  if (phaseState.step !== 'chooseCards') {
    throw new Error(
      `Expected chooseCards step, got ${phaseState.step}`,
    );
  }

  const blackChosen = state.cardState.black.awaitingPlay !== null;
  const whiteChosen = state.cardState.white.awaitingPlay !== null;

  if (blackChosen && whiteChosen) {
    throw new Error('Both players have already chosen cards');
  }

  if (!blackChosen && !whiteChosen) {
    return 'bothPlayers';
  }

  return blackChosen ? 'white' : 'black';
}
