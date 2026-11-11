import type { GameState } from '@game';

/**
 * Whether the round is still in the secret, simultaneous choice of cards
 * (§4.1.1). Each player lays a card face down and the two are revealed
 * together (§4.1.2), so the game is judged at the reveal and not between the
 * two choices. Whichever player's choice happens to arrive first is an
 * accident of the network and may not decide who loses.
 *
 * @param state - The game state
 * @returns True from the start of Phase 1 until the cards are revealed
 */
export function isChoosingCardsInSecret(state: GameState): boolean {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (phaseState === 'none') {
    return false;
  }
  const choosing =
    phaseState.phase === 'playCards' && phaseState.step === 'chooseCards';
  return choosing;
}
