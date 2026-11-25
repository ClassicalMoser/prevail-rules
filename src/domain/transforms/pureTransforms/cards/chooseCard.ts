import type { CommandCard } from '@entities';
import type { OwnedCardState } from '@game';
import { isSameCard } from '@queries';

/**
 * Moves a card from a player's hand to awaitingPlay (choosing a card for play).
 * Pure function operating on a single player's owned card state.
 *
 * In Phase 1 each player picks a card from hand and lays it face down
 * (§4.1.1). `applyChooseCardEvent` calls this where the view can see the
 * hand; `chooseHiddenCard` is the same step where it cannot.
 *
 * @param owned - The player's current owned card state
 * @param card - The card to move from hand to awaitingPlay
 * @returns New owned card state with the card moved
 * @throws Error if card is not in the player's hand
 */
export function chooseCard(
  owned: OwnedCardState,
  card: CommandCard,
): OwnedCardState {
  // A player lays down one card a round (§4.1.1); a second choice would bury
  // the first and lose it from every pile.
  if (owned.awaitingPlay !== null) {
    throw new Error('Player already has a card awaiting play');
  }

  // Only a card in hand can be played (§10.1.1); naming another is a fault in
  // the choice, which validation should have refused.
  const { inHand } = owned;
  const cardInHand = inHand.find((c) => isSameCard(c, card));

  if (!cardInHand) {
    throw new Error(`Command card ${card.id} not found in player's hand`);
  }

  // The chosen card leaves the hand; the others stay, in the order held.
  const newHand = inHand.filter((c) => !isSameCard(c, card));

  // The hand's own copy lies face down until both are revealed (§4.1.2).
  const chosen: OwnedCardState = {
    ...owned,
    awaitingPlay: cardInHand,
    inHand: newHand,
  };
  return chosen;
}
