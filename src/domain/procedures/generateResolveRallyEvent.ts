import type { Board, GameState } from '@entities';
import type { ResolveRallyEvent } from '@events';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_RALLY_EFFECT_TYPE } from '@events';
import { getOtherPlayer } from '@queries';

/**
 * Generates a ResolveRallyEvent by randomly selecting a card to burn.
 * The randomness happens here; the event (with the selected card) is what makes it replayable.
 *
 * @param state - The current game state
 * @returns A complete ResolveRallyEvent with the selected card
 * @throws Error if player has no played cards to burn
 *
 * @example
 * ```typescript
 * // Generate event with random selection
 * const event = generateResolveRallyEvent(state);
 *
 * // Apply to engine
 * const newState = applyEvent(event, state);
 *
 * // Event is now in the log with the random result baked in, making it replayable
 * ```
 */
export function generateResolveRallyEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ResolveRallyEvent<TBoard, 'resolveRally'> {
  const phaseState = state.currentRoundState.currentPhaseState;

  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  if (phaseState.phase !== 'cleanup') {
    throw new Error('Current phase is not cleanup');
  }

  const rallyingPlayer =
    phaseState.step === 'firstPlayerChooseRally'
      ? state.currentInitiative
      : getOtherPlayer(state.currentInitiative);

  const playedCards = state.cardState[rallyingPlayer].played;

  if (playedCards.length === 0) {
    throw new Error(
      `Player ${rallyingPlayer} has no played cards to burn for rally`,
    );
  }

  // Randomly select card (at most 11 cards, so Math.random() is sufficient)
  const index = Math.floor(Math.random() * playedCards.length);
  const cardToBurn = playedCards[index];

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_RALLY_EFFECT_TYPE,
    player: rallyingPlayer,
    card: cardToBurn,
  };
}
