import type { GameState, GameStateForVisibility } from '@game/gameState';

/** Narrows {@link GameState} to the authoritative visibility member. */
export function isAuthoritativeGameState(
  state: GameState,
): state is GameStateForVisibility<'authoritative'> {
  return state.cardState.visibility === 'authoritative';
}
