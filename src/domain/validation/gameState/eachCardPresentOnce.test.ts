import type { Card, CardState } from '@entities';
import { commandCards } from '@sampleValues';
import { describe, expect, it } from 'vitest';
import { eachCardPresentOnce } from './eachCardPresentOnce';

/**
 * eachCardPresentOnce: eachCardPresentOnce.
 */
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
      black: {
        inHand: [...blackHand],
        awaitingPlay: blackAwaitingPlay ?? commandCards[0],
        inPlay: blackInPlay ?? commandCards[1],
        played: blackPlayed ?? [],
        discarded: blackDiscarded ?? [],
        burnt: blackBurnt ?? [],
      },
      white: {
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
    it('given all cards are present once with empty starting hands, returns true', () => {
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

    it('given all black cards are present once in hand, returns true', () => {
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

    it('given all white cards are present once in hand, returns true', () => {
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

    it('given both black and white cards are present once, returns true', () => {
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

    it('given cards are in different states, returns true', () => {
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

    it('given cards are in played, discarded, or burnt states, returns true', () => {
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
    it('given a card appears twice in the same hand, returns false', () => {
      const blackStartingHand = cardSet(0);
      const cardState = createCardState([commandCards[0], commandCards[0]], []);

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        new Set(),
        cardState,
      );
      expect(result).toBe(false);
    });

    it('given a card appears in multiple states, returns false', () => {
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

    it('given the same card appears in both players states, returns true', () => {
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
    it('given a card from starting hand is missing, returns false', () => {
      const blackStartingHand = cardSet(0, 1);
      const cardState = createCardState([commandCards[0]], []);

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        new Set(),
        cardState,
      );
      expect(result).toBe(false);
    });

    it('given black card is missing, returns false', () => {
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

    it('given white card is missing, returns false', () => {
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
    it('given cardState has card not in starting hands, returns false', () => {
      const blackStartingHand = cardSet(0);
      const cardState = createCardState([commandCards[0], commandCards[1]], []);

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        new Set(),
        cardState,
      );
      expect(result).toBe(false);
    });

    it('given awaitingPlay has unexpected card, returns false', () => {
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

    it('given inPlay has unexpected card, returns false', () => {
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

    it('given played array has unexpected card, returns false', () => {
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

    it('given discarded array has unexpected card, returns false', () => {
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

    it('given burnt array has unexpected card, returns false', () => {
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
