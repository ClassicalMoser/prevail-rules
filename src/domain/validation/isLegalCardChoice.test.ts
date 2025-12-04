import type { Card, CardState } from '@entities';
import type { ChooseCardEvent } from '@events';
import { commandCards } from '@sampleValues';
import { isLegalCardChoice } from '@validation';
import { describe, expect, it } from 'vitest';

describe('isLegalCardChoice', () => {
  // Helper to create a card state with cards in hand
  function createCardState(blackHand: Card[], whiteHand: Card[]): CardState {
    return {
      blackPlayer: {
        inHand: [...blackHand],
        awaitingPlay: commandCards[0],
        inPlay: commandCards[1],
        played: [],
        discarded: [],
        burnt: [],
      },
      whitePlayer: {
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
    it('should return true when black player chooses a card in their hand', () => {
      const cardState = createCardState([commandCards[0], commandCards[1]], []);
      const chooseCardEvent: ChooseCardEvent = {
        eventType: 'playerChoice',
        player: 'black',
        card: commandCards[0],
      };

      const result = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBe(true);
    });

    it('should return true when white player chooses a card in their hand', () => {
      const cardState = createCardState([], [commandCards[0], commandCards[1]]);
      const chooseCardEvent: ChooseCardEvent = {
        eventType: 'playerChoice',
        player: 'white',
        card: commandCards[1],
      };

      const result = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBe(true);
    });
  });

  describe('invalid card choices', () => {
    it('should return false when black player chooses a card not in their hand', () => {
      const cardState = createCardState([commandCards[0]], [commandCards[1]]);
      const chooseCardEvent: ChooseCardEvent = {
        eventType: 'playerChoice',
        player: 'black',
        card: commandCards[1], // Card is in white player's hand, not black's
      };

      const result = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBe(false);
    });

    it('should return false when white player chooses a card not in their hand', () => {
      const cardState = createCardState([commandCards[0]], [commandCards[1]]);
      const chooseCardEvent: ChooseCardEvent = {
        eventType: 'playerChoice',
        player: 'white',
        card: commandCards[0], // Card is in black player's hand, not white's
      };

      const result = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBe(false);
    });

    it("should return false when player chooses a card that doesn't exist in any hand", () => {
      const cardState = createCardState([commandCards[0]], [commandCards[1]]);
      const chooseCardEvent: ChooseCardEvent = {
        eventType: 'playerChoice',
        player: 'black',
        card: commandCards[2], // Card is not in either player's hand
      };

      const result = isLegalCardChoice(cardState, chooseCardEvent);

      expect(result).toBe(false);
    });
  });
});
