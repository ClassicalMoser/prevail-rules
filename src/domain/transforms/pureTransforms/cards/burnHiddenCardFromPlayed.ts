import type { CommandCard } from '@entities';
import type { HiddenCardState } from '@game';

/**
 * Burns a specific card from an unowned player's public played pile.
 * Played and burnt piles stay face-up on a hidden slice; hand identity does not change here.
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
  const cardIndex = hidden.played.findIndex(
    (playedCard) => playedCard.id === card.id,
  );
  if (cardIndex === -1) {
    throw new Error(
      `Command card ${card.id} not found in player's played cards`,
    );
  }

  const played = hidden.played.filter(
    (playedCard) => playedCard.id !== card.id,
  );
  const burnt = [...hidden.burnt, card];
  const next: HiddenCardState = {
    ...hidden,
    burnt,
    played,
  };
  return next;
}
