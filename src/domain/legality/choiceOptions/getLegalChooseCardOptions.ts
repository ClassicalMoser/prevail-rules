import type { PlayerSide } from '@entities';
import type { ChooseCardEvent } from '@events';
import type { GameState } from '@game';
import { createChooseCardEvent } from '@factories';
import { getOwnedPlayerCardState, getPlayCardsPhaseState } from '@queries';

/**
 * The players this view may offer a card choice to: those still to choose
 * (§4.1.1) whose hand it can read. Both choose at once, so either or both may
 * still be choosing; a card already chosen waits face down in `awaitingPlay`.
 *
 * @param gameState - The game, under the asking view's visibility
 * @returns The players still choosing whose hands are in view
 */
// TODO(composition): each branch reads `awaitingPlay` off the card state
// inline, where only a query should walk the state; `haveBothPlayersChosenCards`
// in `@queries` reads the same slot for both players at once. Settled by a
// per-player reader there ("has this player chosen a card").
function pendingOwnedPlayers<S extends GameState>(gameState: S): PlayerSide[] {
  const { cardState } = gameState;
  // Named now, so a fault below can say which visibility it met.
  const { visibility } = cardState;
  switch (cardState.visibility) {
    case 'authoritative': {
      // The full record sees both hands, so it offers each player still
      // choosing.
      const pending: PlayerSide[] = [];
      if (cardState.black.awaitingPlay === null) {
        pending.push('black');
      }
      if (cardState.white.awaitingPlay === null) {
        pending.push('white');
      }
      return pending;
    }
    case 'blackSeen': {
      // Black's seat reads only its own hand, so it can offer only black's
      // choice, and only until black has chosen.
      const black: PlayerSide[] =
        cardState.black.awaitingPlay === null ? ['black'] : [];
      return black;
    }
    case 'whiteSeen': {
      // White's seat, likewise, offers only white's own choice.
      const white: PlayerSide[] =
        cardState.white.awaitingPlay === null ? ['white'] : [];
      return white;
    }
    case 'spectator': {
      // Neither hand is readable, so a spectator is offered no card to choose.
      return [];
    }
    default: {
      // A visibility no view of the game has is a fault in the state.
      const _exhaustive: never = cardState;
      throw new Error(`Invalid visibility: ${String(visibility)}`);
    }
  }
}

/**
 * Returns every legal choose-card choice visible under the given game state's
 * card visibility: each pending owned player's in-hand cards as complete
 * {@link ChooseCardEvent} payloads.
 *
 * - Authoritative: options for every player still choosing (`awaitingPlay === null`).
 * - Player-seen: only the viewing player's options (never reads the hidden hand).
 * - Spectator: no options, because neither hand is readable.
 *
 * Nothing asks for a card outside the chooseCards step, so being asked then is
 * the caller's mistake and throws. An empty array is a real answer when every
 * pending player this view can read has already committed, or when nobody's
 * hand is readable (a spectator).
 *
 * Aligns with `isValidChooseCardEvent` membership checks (authoritative)
 * and `getExpectedPlayCardsPhaseEvent` for the chooseCards step.
 *
 * @throws Error outside the play cards phase, or off its chooseCards step
 */
export function getLegalChooseCardOptions<S extends GameState>(
  gameState: S,
): ChooseCardEvent[] {
  // Cards are chosen only on the first step of Phase 1 (§4.1.1); after it
  // they are revealed and compared.
  const phaseState = getPlayCardsPhaseState(gameState);
  if (phaseState.step !== 'chooseCards') {
    throw new Error(`Not on the chooseCards step: ${phaseState.step}`);
  }

  // The players still choosing whose hands this view can read.
  const pendingPlayers = pendingOwnedPlayers(gameState);
  const result: ChooseCardEvent[] = [];

  // Each card in such a hand may be the one played this round (§4.1.1); a
  // card already spent or committed is not in hand, so it is not offered.
  for (const player of pendingPlayers) {
    const hand = getOwnedPlayerCardState(gameState.cardState, player).inHand;
    for (const card of hand) {
      result.push(createChooseCardEvent({ player, card }));
    }
  }

  // What `isValidChooseCardEvent` checks a submitted card against.
  return result;
}
