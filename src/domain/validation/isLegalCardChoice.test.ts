import type { Card, CardState, StandardBoard } from '@entities';
import type { ChooseCardEvent } from '@events';
import { commandCards } from '@sampleValues';
import { describe, expect, it } from 'vitest';
import { isLegalCardChoice } from './isLegalCardChoice';

/**
 * isLegalCardChoice: Validates whether a card choice command is legal.
 */
describe('isLegalCardChoice', () => {
  // Helper to create a card state with cards in hand
  function createCardState(blackHand: Card[], whiteHand: Card[]): CardState {
    return {
      black: {
        inHand: [...blackHand],
        awaitingPlay: commandCards[0],
        inPlay: commandCards[1],
        played: [],
        discarded: [],
        burnt: [],
      },
      white: {
        inHand: [...whiteHand],
        awaitingPlay: commandCards[0],
        inPlay: commandCards[1],
        played: [],
        discarded: [],
        burnt: [],
      },
    };
  }

  describe('valid card choices', () => {
    it('given black player chooses a card in their hand, returns true', () => {
      const cardState = createCardState([commandCards[0], commandCards[1]], []);
      const chooseCardEvent: ChooseCardEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'black',
        card: commandCards[0],
      };

      const { result } = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBe(true);
    });

    it('given white player chooses a card in their hand, returns true', () => {
      const cardState = createCardState([], [commandCards[0], commandCards[1]]);
      const chooseCardEvent: ChooseCardEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'white',
        card: commandCards[1],
      };

      const { result } = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBe(true);
    });
  });

  describe('invalid card choices', () => {
    it('given black player chooses a card not in their hand, returns false', () => {
      const cardState = createCardState([commandCards[0]], [commandCards[1]]);
      const chooseCardEvent: ChooseCardEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'black',
        card: commandCards[1], // Card is in white player's hand, not black's
      };

      const { result } = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBe(false);
    });

    it('given white player chooses a card not in their hand, returns false', () => {
      const cardState = createCardState([commandCards[0]], [commandCards[1]]);
      const chooseCardEvent: ChooseCardEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'white',
        card: commandCards[0], // Card is in black player's hand, not white's
      };

      const { result } = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBe(false);
    });

    it("given player chooses a card that doesn't exist in any hand, returns false", () => {
      const cardState = createCardState([commandCards[0]], [commandCards[1]]);
      const chooseCardEvent: ChooseCardEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'black',
        card: commandCards[2], // Card is not in either player's hand
      };

      const { result } = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBe(false);
    });
  });
});
