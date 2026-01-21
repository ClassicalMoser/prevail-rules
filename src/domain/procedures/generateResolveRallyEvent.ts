import type { Board, GameState, PlayerSide } from '@entities';
import type { ResolveRallyEvent } from '@events';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_RALLY_EFFECT_TYPE } from '@events';

/**
 * Generates a ResolveRallyEvent by deterministically selecting a card to burn.
 * The orchestrator provides random input; this function makes the selection deterministic.
 *
 * @param state - The current game state
 * @param player - The player performing the rally
 * @param randomSeed - Random number from orchestrator (will be modulo'd against array length)
 * @returns A complete ResolveRallyEvent with the selected card
 * @throws Error if player has no played cards to burn
 *
 * @example
 * ```typescript
 * // Orchestrator generates random seed
 * const randomSeed = Math.floor(Math.random() * 1000000);
 *
 * // Generate event deterministically
 * const event = generateResolveRallyEvent(state, 'white', randomSeed);
 *
 * // Apply to engine
 * const newState = applyEvent(event, state);
 *
 * // Event is now in the log with the random result baked in, making it replayable
 * ```
 */
export function generateResolveRallyEvent<TBoard extends Board>(
  state: GameState<TBoard>,
  player: PlayerSide,
  randomSeed: number,
): ResolveRallyEvent<TBoard> {
  const playedCards = state.cardState[player].played;

  if (playedCards.length === 0) {
    throw new Error(`Player ${player} has no played cards to burn for rally`);
  }

  // Deterministically select card using random seed
  const index = Math.abs(randomSeed) % playedCards.length;
  const cardToBurn = playedCards[index];

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_RALLY_EFFECT_TYPE,
    player,
    card: cardToBurn,
  };
}
