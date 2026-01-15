import type { Board, GameState } from '@entities';
import type { ChooseCardEvent } from '@events';

export function applyChooseCardEvent<TBoard extends Board>(
  event: ChooseCardEvent,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const { player, card } = event;
  const oldHand = state.cardState[player].inHand;
  const newHand = oldHand.filter((c) => c.id !== card.id);
  const newPlayerCardState = {
    ...state.cardState[player],
    inHand: newHand,
    awaitingPlay: card,
  };
  const newGameState: GameState<TBoard> = {
    ...state,
    cardState: {
      ...state.cardState,
      [player]: newPlayerCardState,
    },
  };
  return newGameState;
}
