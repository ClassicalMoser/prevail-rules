import type {
  Card,
  CardState,
  FailValidationResult,
  PlayerCardState,
  ValidationResult,
} from '@entities';

export function eachCardPresentOnce(
  blackStartingHand: Set<Card>,
  whiteStartingHand: Set<Card>,
  cardState: CardState,
): ValidationResult {
  try {
    // Helper to validate a single player's card state against their starting hand
    const validatePlayerState = (
      startingHand: Set<Card>,
      playerState: PlayerCardState,
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
      const hasSeenCard = (card: Card): boolean => {
        return seenInPlayerState.some((seen) => seen.id === card.id);
      };

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
            result: false,
            errorReason: 'Card is present more than once',
          };
        }
        if (!removeExpectedCard(card)) {
          // Unexpected card in this player's state
          return {
            result: false,
            errorReason: 'Unexpected card',
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
              result: false,
              errorReason: cardResult.errorReason,
            };
            return validateError;
          }
        }
      }

      // Check single cards
      const awaitingPlayResult = processCard(playerState.awaitingPlay);
      if (!awaitingPlayResult.result) {
        const validateError: FailValidationResult = {
          result: false,
          errorReason: awaitingPlayResult.errorReason,
        };
        return validateError;
      }
      const inPlayResult = processCard(playerState.inPlay);
      if (!inPlayResult.result) {
        const validateError: FailValidationResult = {
          result: false,
          errorReason: inPlayResult.errorReason,
        };
        return validateError;
      }

      // If expectedCards is empty, all expected cards for this player were found
      if (expectedCards.size !== 0) {
        const validateError: FailValidationResult = {
          result: false,
          errorReason: 'Expected cards not found',
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
      result: false,
      errorReason: 'Unknown error',
    };
  }
}
