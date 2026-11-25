import type { CommandCard } from '@entities';
import type { HiddenCardState } from '@game';
import { isSameCard } from '@queries';

/**
 * Burns a specific card from an unowned player's public played pile.
 * Played and burnt piles stay face-up on a hidden slice; hand identity does not change here.
 *
 * The seat-view twin of `burnCardFromPlayed`: a rally burns one played card
 * (§10.3.2), and the played pile is face up, so a seat that cannot see the
 * hand still sees which card burnt. `applyResolveRallyEvent` calls it.
 *
 * @param hidden - The opponent's current hidden card state
 * @param card - The card to burn
 * @returns New hidden card state with the card moved from played to burnt
 * @throws Error if card is not in the played pile
 */
export function burnHiddenCardFromPlayed(
  hidden: HiddenCardState,
  card: CommandCard,
): HiddenCardState {
  // The burn comes from the played pile and nowhere else (§10.2); a card the
  // pile does not hold is a fault in the rally event.
  const cardIndex = hidden.played.findIndex((playedCard) =>
    isSameCard(playedCard, card),
  );
  if (cardIndex === -1) {
    throw new Error(
      `Command card ${card.id} not found in player's played cards`,
    );
  }

  // The burnt card leaves the played pile, so the rest of the pile is what
  // returns to hand.
  const played = hidden.played.filter(
    (playedCard) => !isSameCard(playedCard, card),
  );
  // The played pile is face up, so its own copy goes to the burnt pile.
  const burnt = [...hidden.burnt, hidden.played[cardIndex]];

  // The face-down hand is untouched; the return to hand is
  // `returnHiddenCardsToHand`, next in the rally.
  const next: HiddenCardState = {
    ...hidden,
    burnt,
    played,
  };
  return next;
}
