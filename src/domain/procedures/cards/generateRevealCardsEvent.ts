import type { Board, GameState } from '@entities';
import type { RevealCardsEvent } from '@events';
import { GAME_EFFECT_EVENT_TYPE, REVEAL_CARDS_EFFECT_TYPE } from '@events';

/**
 * Generates a RevealCardsEvent by revealing both players' awaitingPlay cards.
 * This makes hidden information public.
 *
 * @param state - The current game state
 * @returns A complete RevealCardsEvent
 */
export function generateRevealCardsEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): RevealCardsEvent<TBoard, 'revealCards'> {
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: REVEAL_CARDS_EFFECT_TYPE,
  };
}
