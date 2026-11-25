import type { CommandCard } from '@entities';
import type { AuthoritativeCardState, OwnedCardState } from '@game';
import type { FailValidationResult, ValidationResult } from '@utils';
import { failFromFault } from '@utils';
import { isSameCard } from '@queries';

// TODO(composition): no caller. Meant for an integrity check not yet built;
// settled by wiring it where a game is loaded, or deleting it.
// TODO(composition): this checks a whole game record against its armies, as
// `refineGameStateIndex` checks a state against itself; that check is a refine
// in `@legality`, run inside `legalGameSchema` where a game is read. Settle
// whether this belongs there too, as a refine reading `game.whiteArmy` and
// `game.blackArmy`, rather than as a validation entry point nothing reaches.
// TODO(composition): the starting hands come in black then white, where
// `eachUnitPresentOnce` takes its armies white then black. Settle one order
// for both, so a caller wiring the two cannot swap a side unnoticed.
// TODO(wrong): cards are matched by id alone (`isSameCard`), so a pile card
// that keeps an army card's id but claims other stats passes. Units and cards
// travel whole, and a card the game is handed is checked whole elsewhere
// (`isSameCardValue`). Settle whether this check should compare each matched
// card whole against the army's copy, and refuse with the part that differs.
/**
 * Whether every card each army brought is in exactly one of its owner's
 * places, and no other card is there.
 *
 * The cards an army chooses are its hand for the whole battle: nothing is
 * drawn and nothing is added once the battle has begun (§3.1.2). From then on
 * a card moves between its owner's places (hand, face down, in play, played,
 * discarded, burnt; §10.1) but never leaves them, never doubles, and never
 * changes owner. A record that breaks that has lost or invented a card, and
 * with it some of an army's will to fight.
 *
 * It is an entry point: it never throws, and a fault beneath it becomes a
 * refusal through `failFromFault`.
 *
 * @param blackStartingHand - The command cards Black's army brought
 * @param whiteStartingHand - The command cards White's army brought
 * @param cardState - Both players' card places, as the full record holds them
 * @returns A pass when each side's cards are its army's, each once; otherwise
 * the first fault found, Black's side before White's
 */
export function eachCardPresentOnce(
  blackStartingHand: Set<CommandCard>,
  whiteStartingHand: Set<CommandCard>,
  cardState: AuthoritativeCardState,
): ValidationResult {
  try {
    // Helper to validate a single player's card state against their starting hand
    /**
     * Whether one side's places hold exactly the cards its army brought, each
     * once. Each side is judged on its own: two armies may each bring a copy
     * of the same card, and the copies are two cards, one in each army.
     */
    const validatePlayerState = (
      startingHand: Set<CommandCard>,
      playerState: OwnedCardState,
    ): ValidationResult => {
      // Build expected cards set for this player (cards are the same by value, not by reference)
      // Each card the army brought, still to be found somewhere in its
      // owner's places. A card is struck off as it is found, so whatever is
      // left at the end was lost from the record.
      const expectedCards = new Set<CommandCard>();
      for (const card of startingHand) {
        expectedCards.add(card);
      }

      // Track cards that have been seen in this player's state
      // An army holds no card twice (§3.1.5), so a card met a second time in
      // the same side's places is one card recorded in two places.
      const seenInPlayerState: CommandCard[] = [];

      // Helper to find and remove expected card by ID
      // A Set compares by reference, so find the matching card by value first
      /** Strikes a card off the army's list; false when the army never brought it. */
      const removeExpectedCard = (card: CommandCard): boolean => {
        for (const expected of expectedCards) {
          // The id names one card of an army wherever it lies.
          if (isSameCard(expected, card)) {
            expectedCards.delete(expected);
            // Found among the cards the army brought.
            return true;
          }
        }
        // No card of that id is left on the army's list.
        return false;
      };

      // Helper to check if card was already seen in this player's state
      /** Whether this card has already been met in another of the side's places. */
      const hasSeenCard = (card: CommandCard): boolean =>
        seenInPlayerState.some((seen) => isSameCard(seen, card));

      // Helper to process a single card
      /**
       * Accounts for one card in one place: refused when it was already met,
       * or when the army never brought it.
       */
      const processCard = (card: CommandCard | null): ValidationResult => {
        // An empty single place (no card face down yet, or none in play)
        // holds no card, so there is nothing to account for.
        if (card === null) {
          const emptyPlace: ValidationResult = {
            result: true,
          };
          return emptyPlace;
        }

        // Checked before the army's list, so a card in two places is named
        // as that rather than as a card the army never brought, which its
        // second sighting would also be once the first struck it off.
        if (hasSeenCard(card)) {
          // Command card is present more than once in this player's state
          const presentTwice: ValidationResult = {
            errorReason: 'Command card is present more than once',
            result: false,
          };
          return presentTwice;
        }

        // No card can join a hand once the battle has begun (§3.1.2), so a
        // card the army did not bring has no place in its owner's piles.
        if (!removeExpectedCard(card)) {
          // Unexpected card in this player's state
          const unexpected: ValidationResult = {
            errorReason: 'Unexpected card',
            result: false,
          };
          return unexpected;
        }

        // Remembered, so a second sighting is caught as a card in two places.
        seenInPlayerState.push(card);

        // One of the army's cards, accounted for once.
        const accountedFor: ValidationResult = {
          result: true,
        };
        return accountedFor;
      };

      // Check all cards in arrays
      // The piles: the hand, the played pile, the discard pile and the
      // burnt cards. A burnt card is gone from play for good (§10.3.2), but
      // it was one of the army's cards and is still recorded as such.
      const cardArrays = [
        playerState.inHand,
        playerState.played,
        playerState.discarded,
        playerState.burnt,
      ];
      for (const cardArray of cardArrays) {
        for (const card of cardArray) {
          const cardResult = processCard(card);
          // The first card that cannot be accounted for refuses the side.
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
      // The card chosen face down in Phase 1 and not yet revealed (§4.1.1).
      const awaitingPlayResult = processCard(playerState.awaitingPlay);
      if (!awaitingPlayResult.result) {
        const validateError: FailValidationResult = {
          errorReason: awaitingPlayResult.errorReason,
          result: false,
        };
        return validateError;
      }
      // The card revealed and in play for this round (§4.1.2).
      const inPlayResult = processCard(playerState.inPlay);
      if (!inPlayResult.result) {
        const validateError: FailValidationResult = {
          errorReason: inPlayResult.errorReason,
          result: false,
        };
        return validateError;
      }

      // If expectedCards is empty, all expected cards for this player were found
      // A card still on the list is in none of its owner's places: the
      // record has lost it, though cards only ever move between them.
      if (expectedCards.size > 0) {
        const validateError: FailValidationResult = {
          errorReason: 'Expected cards not found',
          result: false,
        };
        return validateError;
      }

      // Every card the army brought, each in exactly one place.
      const allAccountedFor: ValidationResult = {
        result: true,
      };
      return allAccountedFor;
    };

    // Validate each player's state
    // Black's side first; its fault, if any, is the one reported.
    const blackPlayerValid = validatePlayerState(
      blackStartingHand,
      cardState.black,
    );
    if (!blackPlayerValid.result) {
      return blackPlayerValid;
    }
    // Then White's side, against White's own army.
    const whitePlayerValid = validatePlayerState(
      whiteStartingHand,
      cardState.white,
    );
    if (!whitePlayerValid.result) {
      return whitePlayerValid;
    }

    // Both armies' cards are all in the record, each once.
    const consistent: ValidationResult = {
      result: true,
    };
    return consistent;
  } catch (error) {
    // Any fault means the game state cannot be judged consistent.
    // Nothing above throws on a well-typed argument: `isSameCard` reads only
    // ids. The catch keeps this entry point's promise never to throw for a
    // record read from outside that is malformed. No spec reaches it, since
    // one would have to forge a card list through a type assertion.
    const fault = failFromFault(error, 'checking each card is present once');
    return fault;
  }
}
