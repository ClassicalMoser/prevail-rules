import type {
  CardStateForVisibility,
  OwnedCardState,
  GameStateForVisibility,
  GameStateVisibility,
} from '@game';

/**
 * Test-harness helper: returns a new game state with the authoritative card
 * state replaced.
 *
 * Production code updates a single player's slice via `updatePlayerCardState`;
 * this whole-`cardState` setter exists only to set up fixtures.
 *
 * @param state - The current game state
 * @param cardState - The authoritative card state to set
 * @returns A new game state with the updated card state
 *
 * @example
 * ```ts
 * const newState = updateCardState(state, {
 *   ...state.cardState,
 *   black: { ...state.cardState.black, inHand: [card1, card2] },
 * });
 * ```
 */
export function updateCardState<V extends GameStateVisibility>(
  state: GameStateForVisibility<V>,
  cardState: CardStateForVisibility<V>,
): GameStateForVisibility<V> {
  return {
    ...state,
    cardState,
  };
}

/**
 * A game state with one or both players' card piles patched.
 *
 * Specs reach a card situation by spreading the whole slice twice over —
 * `{ ...state.cardState, black: { ...state.cardState.black, inHand: [card] } }` —
 * where only the one named pile carries meaning. This names the piles that
 * matter and leaves the rest alone.
 *
 * Authoritative only. A projected state hides a side's piles, so there is
 * nothing to patch there; build the situation first and project it after.
 *
 * @param state - The authoritative game state
 * @param piles - The piles to set, per side
 * @returns A new game state with those piles replaced
 */
export function withCards(
  state: GameStateForVisibility<'authoritative'>,
  piles: {
    black?: Partial<OwnedCardState>;
    white?: Partial<OwnedCardState>;
  },
): GameStateForVisibility<'authoritative'> {
  return updateCardState(state, {
    ...state.cardState,
    black: { ...state.cardState.black, ...piles.black },
    white: { ...state.cardState.white, ...piles.white },
  });
}
