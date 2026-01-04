import type { Card, CardState, PlayerCardState } from '@entities';

export function eachCardPresentOnce(
  blackStartingHand: Set<Card>,
  whiteStartingHand: Set<Card>,
  cardState: CardState,
): boolean {
  // Helper to validate a single player's card state against their starting hand
  const validatePlayerState = (
    startingHand: Set<Card>,
    playerState: PlayerCardState,
  ): boolean => {
    // Build expected cards set for this player (we'll use card ID for equality checks)
    const expectedCards = new Set<Card>();
    for (const card of startingHand) {
      expectedCards.add(card);
    }

    // Track cards that have been seen in this player's state
    const seenInPlayerState: Card[] = [];

    // Helper to find and remove expected card by ID
    // Since Sets use referential equality, we need to find the matching card first
    const removeExpectedCard = (card: Card): boolean => {
      for (const expected of expectedCards) {
        if (expected.id === card.id) {
          expectedCards.delete(expected);
          return true;
        }
      }
      return false;
    };

    // Helper to check if card was already seen in this player's state
    const hasSeenCard = (card: Card): boolean => {
      return seenInPlayerState.some((seen) => seen.id === card.id);
    };

    // Helper to process a single card
    const processCard = (card: Card): boolean => {
      if (hasSeenCard(card)) {
        // Card is present more than once in this player's state
        return false;
      }
      if (!removeExpectedCard(card)) {
        // Unexpected card in this player's state
        return false;
      }
      seenInPlayerState.push(card);
      return true;
    };

    // Check all cards in arrays
    const cardArrays = [
      playerState.inHand,
      playerState.played,
      playerState.discarded,
      playerState.burnt,
    ];
    for (const cardArray of cardArrays) {
      for (const card of cardArray) {
        if (!processCard(card)) {
          return false;
        }
      }
    }

    // Check single cards
    if (!processCard(playerState.awaitingPlay)) {
      return false;
    }
    if (!processCard(playerState.inPlay)) {
      return false;
    }

    // If expectedCards is empty, all expected cards for this player were found
    return expectedCards.size === 0;
  };

  // Validate each player's state
  const blackPlayerValid = validatePlayerState(
    blackStartingHand,
    cardState.blackPlayer,
  );
  const whitePlayerValid = validatePlayerState(
    whiteStartingHand,
    cardState.whitePlayer,
  );
  return blackPlayerValid && whitePlayerValid;
}
