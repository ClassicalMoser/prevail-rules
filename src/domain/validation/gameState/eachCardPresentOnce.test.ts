import type { Card, CardState } from '@entities';
import { commandCards } from '@sampleValues';
import { describe, expect, it } from 'vitest';
import { eachCardPresentOnce } from './eachCardPresentOnce';

describe('eachCardPresentOnce', () => {
  // Helper to create a card set from indices
  const cardSet = (...indices: number[]): Set<Card> =>
    new Set(indices.map((i) => commandCards[i]));

  // Helper to create a card state
  function createCardState(
    blackHand: Card[],
    whiteHand: Card[],
    blackAwaitingPlay?: Card,
    blackInPlay?: Card,
    blackPlayed?: Card[],
    blackDiscarded?: Card[],
    blackBurnt?: Card[],
    whiteAwaitingPlay?: Card,
    whiteInPlay?: Card,
    whitePlayed?: Card[],
    whiteDiscarded?: Card[],
    whiteBurnt?: Card[],
  ): CardState {
    return {
      blackPlayer: {
        inHand: [...blackHand],
        awaitingPlay: blackAwaitingPlay ?? commandCards[0],
        inPlay: blackInPlay ?? commandCards[1],
        played: blackPlayed ?? [],
        discarded: blackDiscarded ?? [],
        burnt: blackBurnt ?? [],
      },
      whitePlayer: {
        inHand: [...whiteHand],
        awaitingPlay: whiteAwaitingPlay ?? commandCards[0],
        inPlay: whiteInPlay ?? commandCards[1],
        played: whitePlayed ?? [],
        discarded: whiteDiscarded ?? [],
        burnt: whiteBurnt ?? [],
      },
    };
  }

  describe('valid cases', () => {
    it('should return true when all cards are present once with empty starting hands', () => {
      // Note: createCardState defaults awaitingPlay and inPlay to commandCards[0] and commandCards[1]
      // So we need to include those in starting hands
      // Cards can be duplicated between players
      const blackStartingHand = cardSet(0, 1);
      const whiteStartingHand = cardSet(0, 1);
      const cardState = createCardState([], []);
      const { result } = eachCardPresentOnce(
        blackStartingHand,
        whiteStartingHand,
        cardState,
      );
      expect(result).toBe(true);
    });

    it('should return true when all black cards are present once in hand', () => {
      const blackStartingHand = cardSet(0, 1, 2, 3);
      const whiteStartingHand = cardSet(0, 1);
      const cardState = createCardState(
        [commandCards[0], commandCards[1]],
        [],
        commandCards[2],
        commandCards[3],
      );

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        whiteStartingHand,
        cardState,
      );
      expect(result).toBe(true);
    });

    it('should return true when all white cards are present once in hand', () => {
      // Default cards: black has commandCards[0] awaitingPlay, commandCards[1] inPlay
      // white has commandCards[0] awaitingPlay, commandCards[1] inPlay
      const blackStartingHand = cardSet(0, 1);
      const whiteStartingHand = cardSet(0, 1, 2);
      const cardState = createCardState([], [commandCards[2]]);

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        whiteStartingHand,
        cardState,
      );
      expect(result).toBe(true);
    });

    it('should return true when both black and white cards are present once', () => {
      // Default cards: both players have commandCards[0] awaitingPlay, commandCards[1] inPlay
      const blackStartingHand = cardSet(0, 1, 2);
      const whiteStartingHand = cardSet(0, 1, 3);
      const cardState = createCardState([commandCards[2]], [commandCards[3]]);

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        whiteStartingHand,
        cardState,
      );
      expect(result).toBe(true);
    });

    it('should return true when cards are in different states', () => {
      const blackStartingHand = cardSet(0, 1);
      const whiteStartingHand = cardSet(2, 3);
      const cardState = createCardState(
        [],
        [],
        commandCards[1],
        commandCards[0],
        [],
        [],
        [],
        commandCards[3],
        commandCards[2],
        [],
        [],
        [],
      );

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        whiteStartingHand,
        cardState,
      );
      expect(result).toBe(true);
    });

    it('should return true when cards are in played, discarded, or burnt states', () => {
      // Cards in different states: awaitingPlay, inPlay, played, discarded, burnt
      const blackStartingHand = cardSet(0, 1, 2);
      const whiteStartingHand = cardSet(0, 1, 2, 3);
      const cardState = createCardState(
        [],
        [],
        commandCards[0],
        commandCards[1],
        [commandCards[2]],
        [],
        [],
        commandCards[0],
        commandCards[1],
        [],
        [commandCards[2]],
        [commandCards[3]],
      );

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        whiteStartingHand,
        cardState,
      );
      expect(result).toBe(true);
    });
  });

  describe('duplicate cards', () => {
    it('should return false when a card appears twice in the same hand', () => {
      const blackStartingHand = cardSet(0);
      const cardState = createCardState([commandCards[0], commandCards[0]], []);

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        new Set(),
        cardState,
      );
      expect(result).toBe(false);
    });

    it('should return false when a card appears in multiple states', () => {
      const blackStartingHand = cardSet(0, 1);
      const cardState = createCardState(
        [commandCards[0]],
        [],
        commandCards[0],
        commandCards[1],
      );

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        new Set(),
        cardState,
      );
      expect(result).toBe(false);
    });

    it('should return true when the same card appears in both players states', () => {
      // Cards can be duplicated between players
      // Default cards: both players have commandCards[0] awaitingPlay, commandCards[1] inPlay
      const blackStartingHand = new Set([
        commandCards[0],
        commandCards[1],
        commandCards[2],
      ]);
      const whiteStartingHand = cardSet(0, 1, 2);
      const cardState = createCardState([commandCards[2]], [commandCards[2]]);

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        whiteStartingHand,
        cardState,
      );
      expect(result).toBe(true);
    });
  });

  describe('missing cards', () => {
    it('should return false when a card from starting hand is missing', () => {
      const blackStartingHand = cardSet(0, 1);
      const cardState = createCardState([commandCards[0]], []);

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        new Set(),
        cardState,
      );
      expect(result).toBe(false);
    });

    it('should return false when black card is missing', () => {
      const blackStartingHand = cardSet(0);
      const whiteStartingHand = cardSet(1);
      const cardState = createCardState([], [commandCards[1]]);

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        whiteStartingHand,
        cardState,
      );
      expect(result).toBe(false);
    });

    it('should return false when white card is missing', () => {
      const blackStartingHand = cardSet(0);
      const whiteStartingHand = cardSet(1);
      const cardState = createCardState([commandCards[0]], []);

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        whiteStartingHand,
        cardState,
      );
      expect(result).toBe(false);
    });
  });

  describe('unexpected cards', () => {
    it('should return false when cardState has card not in starting hands', () => {
      const blackStartingHand = cardSet(0);
      const cardState = createCardState([commandCards[0], commandCards[1]], []);

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        new Set(),
        cardState,
      );
      expect(result).toBe(false);
    });

    it('should return false when awaitingPlay has unexpected card', () => {
      const blackStartingHand = cardSet(0, 2);
      const cardState = createCardState(
        [commandCards[0]],
        [],
        commandCards[1],
        commandCards[2],
      );

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        new Set(),
        cardState,
      );
      expect(result).toBe(false);
    });

    it('should return false when inPlay has unexpected card', () => {
      const blackStartingHand = cardSet(0, 2);
      const cardState = createCardState(
        [commandCards[0]],
        [],
        commandCards[2],
        commandCards[1],
      );

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        new Set(),
        cardState,
      );
      expect(result).toBe(false);
    });

    it('should return false when played array has unexpected card', () => {
      const blackStartingHand = cardSet(0, 2);
      const cardState = createCardState(
        [commandCards[0]],
        [],
        commandCards[2],
        commandCards[2],
        [commandCards[1]],
      );

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        new Set(),
        cardState,
      );
      expect(result).toBe(false);
    });

    it('should return false when discarded array has unexpected card', () => {
      const blackStartingHand = cardSet(0, 2);
      const cardState = createCardState(
        [commandCards[0]],
        [],
        commandCards[2],
        commandCards[2],
        [],
        [commandCards[1]],
      );

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        new Set(),
        cardState,
      );
      expect(result).toBe(false);
    });

    it('should return false when burnt array has unexpected card', () => {
      const blackStartingHand = cardSet(0, 2);
      const cardState = createCardState(
        [commandCards[0]],
        [],
        commandCards[2],
        commandCards[2],
        [],
        [],
        [commandCards[1]],
      );

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        new Set(),
        cardState,
      );
      expect(result).toBe(false);
    });
  });
});
