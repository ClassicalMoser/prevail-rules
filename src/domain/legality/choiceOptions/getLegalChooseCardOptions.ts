import type { PlayerSide } from '@entities';
import type { ChooseCardEvent } from '@events';
import type { GameState } from '@game';
import { createChooseCardEvent } from '@factories';
import { getOwnedPlayerCardState, getPlayCardsPhaseState } from '@queries';

function pendingOwnedPlayers<S extends GameState>(gameState: S): PlayerSide[] {
  const { cardState } = gameState;
  switch (cardState.visibility) {
    case 'authoritative': {
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
      return cardState.black.awaitingPlay === null ? ['black'] : [];
    }
    case 'whiteSeen': {
      return cardState.white.awaitingPlay === null ? ['white'] : [];
    }
    case 'spectator': {
      // Neither hand is readable, so a spectator is offered no card to choose.
      return [];
    }
    default: {
      const _exhaustive: never = cardState;
      return _exhaustive;
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
 * Aligns with {@link isValidChooseCardEvent} membership checks (authoritative)
 * and {@link getExpectedPlayCardsPhaseEvent} for the chooseCards step.
 *
 * @throws Error outside the play cards phase, or off its chooseCards step
 */
export function getLegalChooseCardOptions<S extends GameState>(
  gameState: S,
): ChooseCardEvent[] {
  const phaseState = getPlayCardsPhaseState(gameState);
  if (phaseState.step !== 'chooseCards') {
    throw new Error(`Not on the chooseCards step: ${phaseState.step}`);
  }

  const pendingPlayers = pendingOwnedPlayers(gameState);
  const result: ChooseCardEvent[] = [];

  for (const player of pendingPlayers) {
    const hand = getOwnedPlayerCardState(gameState.cardState, player).inHand;
    for (const card of hand) {
      result.push(createChooseCardEvent({ player, card }));
    }
  }

  return result;
}
