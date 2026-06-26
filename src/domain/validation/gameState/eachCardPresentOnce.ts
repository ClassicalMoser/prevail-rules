import type {
  Card,
  AuthoritativeCardState,
  FailValidationResult,
  OwnedCardState,
  ValidationResult,
} from '@entities';

export function eachCardPresentOnce(
  blackStartingHand: Set<Card>,
  whiteStartingHand: Set<Card>,
  cardState: AuthoritativeCardState,
): ValidationResult {
  try {
    // Helper to validate a single player's card state against their starting hand
    const validatePlayerState = (
      startingHand: Set<Card>,
      playerState: OwnedCardState,
    ): ValidationResult => {
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
      const hasSeenCard = (card: Card): boolean =>
        seenInPlayerState.some((seen) => seen.id === card.id);

      // Helper to process a single card
      const processCard = (card: Card | null): ValidationResult => {
        if (card === null) {
          return {
            result: true,
          };
        }
        if (hasSeenCard(card)) {
          // Card is present more than once in this player's state
          return {
            errorReason: 'Card is present more than once',
            result: false,
          };
        }
        if (!removeExpectedCard(card)) {
          // Unexpected card in this player's state
          return {
            errorReason: 'Unexpected card',
            result: false,
          };
        }
        seenInPlayerState.push(card);
        return {
          result: true,
        };
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
          const cardResult = processCard(card);
          if (!cardResult.result) {
            const validateError: FailValidationResult = {
              errorReason: cardResult.errorReason,
              result: false,
            };
            return validateError;
          }
        }
      }

      // Check single cards
      const awaitingPlayResult = processCard(playerState.awaitingPlay);
      if (!awaitingPlayResult.result) {
        const validateError: FailValidationResult = {
          errorReason: awaitingPlayResult.errorReason,
          result: false,
        };
        return validateError;
      }
      const inPlayResult = processCard(playerState.inPlay);
      if (!inPlayResult.result) {
        const validateError: FailValidationResult = {
          errorReason: inPlayResult.errorReason,
          result: false,
        };
        return validateError;
      }

      // If expectedCards is empty, all expected cards for this player were found
      if (expectedCards.size > 0) {
        const validateError: FailValidationResult = {
          errorReason: 'Expected cards not found',
          result: false,
        };
        return validateError;
      }
      return {
        result: true,
      };
    };

    // Validate each player's state
    const blackPlayerValid = validatePlayerState(
      blackStartingHand,
      cardState.black,
    );
    if (!blackPlayerValid.result) {
      return blackPlayerValid;
    }
    const whitePlayerValid = validatePlayerState(
      whiteStartingHand,
      cardState.white,
    );
    if (!whitePlayerValid.result) {
      return whitePlayerValid;
    }
    return {
      result: true,
    };
  } catch {
    // Any error means the game state is invalid
    return {
      errorReason: 'Unknown error',
      result: false,
    };
  }
}
