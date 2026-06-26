import type { AuthoritativeCardState, Card } from '@entities';
import type { ChooseCardEvent } from '@events';
import { tempCommandCards } from '@sampleValues';

import { isLegalCardChoice } from './isLegalCardChoice';

/**
 * IsLegalCardChoice: Validates whether a card choice command is legal.
 */
describe(isLegalCardChoice, () => {
  // Helper to create a card state with cards in hand
  function createCardState(
    blackHand: Card[],
    whiteHand: Card[],
  ): AuthoritativeCardState {
    return {
      visibility: 'authoritative',
      black: {
        awaitingPlay: tempCommandCards[0],
        burnt: [],
        discarded: [],
        inHand: [...blackHand],
        inPlay: tempCommandCards[1],
        played: [],
      },
      white: {
        awaitingPlay: tempCommandCards[0],
        burnt: [],
        discarded: [],
        inHand: [...whiteHand],
        inPlay: tempCommandCards[1],
        played: [],
      },
    };
  }

  describe('valid card choices', () => {
    it('given black player chooses a card in their hand, returns true', () => {
      const cardState = createCardState(
        [tempCommandCards[0], tempCommandCards[1]],
        [],
      );
      const chooseCardEvent: ChooseCardEvent = {
        card: tempCommandCards[0],
        choiceType: 'chooseCard',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'black',
      };

      const { result } = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBeTruthy();
    });

    it('given white player chooses a card in their hand, returns true', () => {
      const cardState = createCardState(
        [],
        [tempCommandCards[0], tempCommandCards[1]],
      );
      const chooseCardEvent: ChooseCardEvent = {
        card: tempCommandCards[1],
        choiceType: 'chooseCard',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
      };

      const { result } = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBeTruthy();
    });
  });

  describe('invalid card choices', () => {
    it('given black player chooses a card not in their hand, returns false', () => {
      const cardState = createCardState(
        [tempCommandCards[0]],
        [tempCommandCards[1]],
      );
      const chooseCardEvent: ChooseCardEvent = {
        card: tempCommandCards[1],
        choiceType: 'chooseCard',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'black', // Card is in white player's hand, not black's
      };

      const { result } = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBeFalsy();
    });

    it('given white player chooses a card not in their hand, returns false', () => {
      const cardState = createCardState(
        [tempCommandCards[0]],
        [tempCommandCards[1]],
      );
      const chooseCardEvent: ChooseCardEvent = {
        card: tempCommandCards[0],
        choiceType: 'chooseCard',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white', // Card is in black player's hand, not white's
      };

      const { result } = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBeFalsy();
    });

    it("given player chooses a card that doesn't exist in any hand, returns false", () => {
      const cardState = createCardState(
        [tempCommandCards[0]],
        [tempCommandCards[1]],
      );
      const chooseCardEvent: ChooseCardEvent = {
        card: tempCommandCards[2],
        choiceType: 'chooseCard',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'black', // Card is not in either player's hand
      };

      const { result } = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBeFalsy();
    });
  });
});
