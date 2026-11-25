import type { GameState } from '@game';
import { isNone } from '@utils';
import { haveBothPlayersChosenCards } from '../card/haveBothPlayersChosenCards';

/**
 * Whether the round is still in the secret, simultaneous choice of cards
 * (§4.1.1). Each player lays a card face down and the two are revealed
 * together (§4.1.2), so the game is judged at the reveal and not between the
 * two choices. Whichever player's choice happens to arrive first is an
 * accident of the network and may not decide who loses.
 *
 * @param state - The game state
 * @returns True from the start of Phase 1 until both cards are chosen
 */
export function isChoosingCardsInSecret(state: GameState): boolean {
  // Setup has no phase, so no card is being chosen.
  const phaseState = state.currentRoundState.currentPhaseState;
  if (isNone(phaseState)) {
    return false;
  }

  // The choice is still secret on the chooseCards step until the second card
  // is laid; once both are in, the hands are judged before the reveal.
  const choosing =
    phaseState.phase === 'playCards' &&
    phaseState.step === 'chooseCards' &&
    !haveBothPlayersChosenCards(state.cardState);

  // True while the second card is still to be laid.
  return choosing;
}
