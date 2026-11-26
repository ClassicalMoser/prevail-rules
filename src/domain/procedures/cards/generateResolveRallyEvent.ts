import type { RandomSource } from '@utils';
import type { ResolveRallyEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_RALLY_EFFECT_TYPE } from '@events';
import { getRallyingPlayer } from '@queries';

/**
 * Generates a ResolveRallyEvent by randomly selecting a card to burn.
 * The draw happens here; the event (with the selected card) is what makes it
 * replayable. The source is the caller's, so a fixed one burns the same card.
 *
 * The player is the one whose rally the step is on ({@link getRallyingPlayer}), as
 * for `getLegalAssignUnitSupport`.
 *
 * @param state - The current game state
 * @param random - The source of the draw that picks the burnt card
 * @returns A complete ResolveRallyEvent with the selected card
 * @throws Error if player has no played cards to burn
 * @throws Error if cleanup is not on a rally step
 *
 * @example
 * ```typescript
 * // Generate event with random selection
 * const event = generateResolveRallyEvent(state, random);
 *
 * // Apply to engine
 * const newState = applyEvent(event, state);
 *
 * // Event is now in the log with the random result baked in, making it replayable
 * ```
 */
export function generateResolveRallyEvent(
  state: GameState,
  random: RandomSource,
): ResolveRallyEvent {
  // The first player rallies first, then the second (§10.3.1); the step says
  // whose rally this is.
  const rallyingPlayer = getRallyingPlayer(state);

  // The burn comes from the rallying player's played pile (§10.3.2). Played
  // cards lie face up, so every view of the game holds them.
  // TODO(composition): the played pile is read off the card state by hand,
  // here and in `getLegalChooseRallyEvent`. Settle with a `@queries` reader
  // both ask.
  const playedCards = state.cardState[rallyingPlayer].played;

  // There is always something to burn: this round's card went to the played
  // pile at the start of Cleanup (§10.3.3). An empty pile is a fault in the
  // state, not a rally with nothing to lose.
  if (playedCards.length === 0) {
    throw new Error(
      `Player ${rallyingPlayer} has no played cards to burn for rally`,
    );
  }

  // The draw belongs to the caller: a fixed source replays the same burn.
  // The burnt card is drawn at random, by design (§10.3.2): each played card
  // has an equal share of the draw, which lies in [0, 1).
  const draw = random.nextFloat();
  const index = Math.floor(draw * playedCards.length);
  const cardToBurn = playedCards[index];

  // The burnt card is the state's own copy, and it goes on the event: the
  // draw is not repeated on replay, and the apply burns this card and returns
  // every other played and discarded card to hand.
  const resolveRally: ResolveRallyEvent = {
    burntCard: cardToBurn,
    effectType: RESOLVE_RALLY_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    player: rallyingPlayer,
  };

  // The effect that carries out this player's rally, before their support
  // check (§10.4).
  return resolveRally;
}
