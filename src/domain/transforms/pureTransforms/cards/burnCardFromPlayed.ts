import type { CommandCard } from '@entities';
import type { OwnedCardState } from '@game';
import { isSameCard } from '@queries';

/**
 * Burns a specific card from the player's played pile.
 * Pure function operating on a single player's owned card state.
 *
 * A rally burns one played card, drawn at random, and it is out of the game
 * for good (§10.3.2). The draw is the procedure's; `applyResolveRallyEvent`
 * passes the drawn card here, for a hand this view can see.
 *
 * @param owned - The player's current owned card state
 * @param card - The card to burn
 * @returns New owned card state with the card burned
 * @throws Error if card is not in played pile
 */
export function burnCardFromPlayed(
  owned: OwnedCardState,
  card: CommandCard,
): OwnedCardState {
  // The burn comes from the played pile and nowhere else (§10.2); a card the
  // pile does not hold is a fault in the rally event.
  const cardIndex = owned.played.findIndex((c) => isSameCard(c, card));
  if (cardIndex === -1) {
    throw new Error(
      `Command card ${card.id} not found in player's played cards`,
    );
  }

  // The burnt card leaves the played pile, so the rest of the pile is what
  // returns to hand.
  const newPlayed = owned.played.filter((c) => !isSameCard(c, card));
  // The played pile's own copy goes to the burnt pile, as the card prints.
  const newBurnt = [...owned.burnt, owned.played[cardIndex]];

  // The hand, the discard pile and this round's slots are untouched; the
  // return to hand is `returnCardsToHand`, next in the rally.
  const burned: OwnedCardState = {
    ...owned,
    burnt: newBurnt,
    played: newPlayed,
  };
  return burned;
}
