import type {
  Board,
  CardState,
  GameState,
  PhaseState,
  PlayerCardState,
} from '@entities';

/**
 * Creates a new game state with the phase state updated.
 * Handles the nested spreading required to update phase state immutably.
 *
 * @param state - The current game state
 * @param phaseState - The new phase state to set
 * @returns A new game state with the updated phase state
 *
 * @example
 * ```ts
 * const state = createEmptyGameState();
 * const newState = withPhaseState(state, {
 *   phase: PLAY_CARDS_PHASE,
 *   step: 'chooseCards',
 * });
 * ```
 */
export function withPhaseState<TBoard extends Board>(
  state: GameState<TBoard>,
  phaseState: PhaseState<TBoard>,
): GameState<TBoard> {
  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: phaseState,
    },
  };
}

/**
 * Creates a new game state with the card state updated.
 * Handles the nested spreading required to update card state immutably.
 *
 * @param state - The current game state
 * @param cardState - The new card state to set, or a function that receives the current card state and returns a new one
 * @returns A new game state with the updated card state
 *
 * @example
 * ```ts
 * // Replace entire card state
 * const newState = withCardState(state, {
 *   black: { ...state.cardState.black, inHand: [card1, card2] },
 *   white: state.cardState.white,
 * });
 *
 * // Update using a function
 * const newState = withCardState(state, (current) => ({
 *   ...current,
 *   black: { ...current.black, inHand: [card1, card2] },
 * }));
 * ```
 */
export function withCardState<TBoard extends Board>(
  state: GameState<TBoard>,
  cardState: CardState | ((current: CardState) => CardState),
): GameState<TBoard> {
  const newCardState =
    typeof cardState === 'function' ? cardState(state.cardState) : cardState;
  return {
    ...state,
    cardState: newCardState,
  };
}

/**
 * Creates a new game state with a player's card state updated.
 * Handles the nested spreading required to update player card state immutably.
 *
 * @param state - The current game state
 * @param player - The player whose card state to update
 * @param playerCardState - The new player card state to set, or a function that receives the current player card state and returns a new one
 * @returns A new game state with the updated player card state
 *
 * @example
 * ```ts
 * // Replace player's card state
 * const newState = withPlayerCardState(state, 'black', {
 *   ...state.cardState.black,
 *   inHand: [card1, card2],
 *   awaitingPlay: null,
 * });
 *
 * // Update using a function
 * const newState = withPlayerCardState(state, 'black', (current) => ({
 *   ...current,
 *   inHand: [...current.inHand, newCard],
 * }));
 * ```
 */
export function withPlayerCardState<TBoard extends Board>(
  state: GameState<TBoard>,
  player: 'black' | 'white',
  playerCardState:
    | PlayerCardState
    | ((current: PlayerCardState) => PlayerCardState),
): GameState<TBoard> {
  const currentPlayerCardState = state.cardState[player];
  const newPlayerCardState =
    typeof playerCardState === 'function'
      ? playerCardState(currentPlayerCardState)
      : playerCardState;

  return {
    ...state,
    cardState: {
      ...state.cardState,
      [player]: newPlayerCardState,
    },
  };
}
