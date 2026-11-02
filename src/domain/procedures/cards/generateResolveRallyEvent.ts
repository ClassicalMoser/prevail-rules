import type { RandomSource } from '@utils';
import type { ResolveRallyEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_RALLY_EFFECT_TYPE } from '@events';
import type { PlayerSide } from '@entities';
import { getCleanupPhaseState, getOtherPlayer } from '@queries';

/**
 * Generates a ResolveRallyEvent by randomly selecting a card to burn.
 * The draw happens here; the event (with the selected card) is what makes it
 * replayable. The source is the caller's, so a fixed one burns the same card.
 *
 * Player is taken from the cleanup resolve-rally step + initiative (same as
 * {@link getLegalAssignUnitSupport} / assign-unit-support).
 *
 * @param state - The current game state
 * @param eventNumber - The ordered index of this event in the round (zero-indexed)
 * @param random - The source of the draw that picks the burnt card
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
export function generateResolveRallyEvent(
  state: GameState,
  eventNumber: number,
  random: RandomSource,
): ResolveRallyEvent {
  const phaseState = getCleanupPhaseState(state);
  const firstPlayer = state.currentInitiative;
  let rallyingPlayer: PlayerSide;

  if (phaseState.step === 'firstPlayerResolveRally') {
    rallyingPlayer = firstPlayer;
  } else if (phaseState.step === 'secondPlayerResolveRally') {
    rallyingPlayer = getOtherPlayer(firstPlayer);
  } else {
    throw new Error(
      `Cleanup phase is not on a resolveRally step: ${phaseState.step}`,
    );
  }

  const playedCards = state.cardState[rallyingPlayer].played;

  if (playedCards.length === 0) {
    throw new Error(
      `Player ${rallyingPlayer} has no played cards to burn for rally`,
    );
  }

  // The draw belongs to the caller: a fixed source replays the same burn.
  const index = Math.floor(random.nextFloat() * playedCards.length);
  const cardToBurn = playedCards[index];

  return {
    card: cardToBurn,
    effectType: RESOLVE_RALLY_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
    player: rallyingPlayer,
  };
}
