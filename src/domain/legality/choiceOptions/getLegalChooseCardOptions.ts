import type { PlayerSide } from '@entities';
import type { ChooseCardEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import type { GameState } from '@game';
import { getNextEventNumber, getOwnedPlayerCardState } from '@queries';

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
    default: {
      const _exhaustive: never = cardState;
      return _exhaustive;
    }
  }
}

/**
 * Returns every legal choose-card choice visible under the given game state's
 * card visibility: each pending owned player's in-hand cards as complete
 * {@link ChooseCardEvent} payloads (with `eventNumber` from the round stream).
 *
 * - Authoritative: options for every player still choosing (`awaitingPlay === null`).
 * - Player-seen: only the viewing player's options (never reads the hidden hand).
 *
 * Returns an empty array when no choose-card input is expected (wrong phase/step,
 * or every owned pending player has already committed). Does not throw for those
 * soft conditions so clients can re-enumerate after a peer commits.
 *
 * Aligns with {@link isValidChooseCardEvent} membership checks (authoritative)
 * and {@link getExpectedPlayCardsPhaseEvent} for the chooseCards step.
 */
export function getLegalChooseCardOptions<S extends GameState>(
  gameState: S,
): ChooseCardEvent[] {
  const phaseState = gameState.currentRoundState.currentPhaseState;
  if (phaseState === 'none' || phaseState.phase !== 'playCards') {
    return [];
  }
  if (phaseState.step !== 'chooseCards') {
    return [];
  }

  const eventNumber = getNextEventNumber(gameState);
  const pendingPlayers = pendingOwnedPlayers(gameState);
  const result: ChooseCardEvent[] = [];

  for (const player of pendingPlayers) {
    const hand = getOwnedPlayerCardState(gameState.cardState, player).inHand;
    for (const card of hand) {
      result.push({
        card,
        choiceType: 'chooseCard',
        eventNumber,
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        player,
      });
    }
  }

  return result;
}
