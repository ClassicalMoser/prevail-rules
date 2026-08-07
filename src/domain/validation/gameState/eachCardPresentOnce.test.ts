import type { AuthoritativeCardState, CommandCard } from '@entities';
import { tempCommandCards } from '@sampleValues';

import { eachCardPresentOnce } from './eachCardPresentOnce';

/**
 * EachCardPresentOnce: eachCardPresentOnce.
 */
describe(eachCardPresentOnce, () => {
  // Helper to create a card set from indices
  const cardSet = (...indices: number[]): Set<CommandCard> =>
    new Set(indices.map((i) => tempCommandCards[i]));

  // Helper to create a card state
  function createCardState(
    blackHand: CommandCard[],
    whiteHand: CommandCard[],
    blackAwaitingPlay?: CommandCard,
    blackInPlay?: CommandCard,
    blackPlayed?: CommandCard[],
    blackDiscarded?: CommandCard[],
    blackBurnt?: CommandCard[],
    whiteAwaitingPlay?: CommandCard,
    whiteInPlay?: CommandCard,
    whitePlayed?: CommandCard[],
    whiteDiscarded?: CommandCard[],
    whiteBurnt?: CommandCard[],
  ): AuthoritativeCardState {
    return {
      visibility: 'authoritative',
      black: {
        awaitingPlay: blackAwaitingPlay ?? tempCommandCards[0],
        burnt: blackBurnt ?? [],
        discarded: blackDiscarded ?? [],
        inHand: [...blackHand],
        inPlay: blackInPlay ?? tempCommandCards[1],
        played: blackPlayed ?? [],
      },
      white: {
        awaitingPlay: whiteAwaitingPlay ?? tempCommandCards[0],
        burnt: whiteBurnt ?? [],
        discarded: whiteDiscarded ?? [],
        inHand: [...whiteHand],
        inPlay: whiteInPlay ?? tempCommandCards[1],
        played: whitePlayed ?? [],
      },
    };
  }

  describe('valid cases', () => {
    it('given all cards are present once with empty starting hands, returns true', () => {
      // Note: createCardState defaults awaitingPlay and inPlay to tempCommandCards[0] and tempCommandCards[1]
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
        [tempCommandCards[0], tempCommandCards[1]],
        [],
        tempCommandCards[2],
        tempCommandCards[3],
      );

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        whiteStartingHand,
        cardState,
      );
      expect(result).toBe(true);
    });

    it('given all white cards are present once in hand, returns true', () => {
      // Default cards: black has tempCommandCards[0] awaitingPlay, tempCommandCards[1] inPlay
      // White has tempCommandCards[0] awaitingPlay, tempCommandCards[1] inPlay
      const blackStartingHand = cardSet(0, 1);
      const whiteStartingHand = cardSet(0, 1, 2);
      const cardState = createCardState([], [tempCommandCards[2]]);

      const { result } = eachCardPresentOnce(
        blackStartingHand,
        whiteStartingHand,
        cardState,
      );
      expect(result).toBe(true);
    });

    it('given both black and white cards are present once, returns true', () => {
      // Default cards: both players have tempCommandCards[0] awaitingPlay, tempCommandCards[1] inPlay
      const blackStartingHand = cardSet(0, 1, 2);
      const whiteStartingHand = cardSet(0, 1, 3);
      const cardState = createCardState(
        [tempCommandCards[2]],
        [tempCommandCards[3]],
      );

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
        tempCommandCards[1],
        tempCommandCards[0],
        [],
        [],
        [],
        tempCommandCards[3],
        tempCommandCards[2],
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
        tempCommandCards[0],
        tempCommandCards[1],
        [tempCommandCards[2]],
        [],
        [],
        tempCommandCards[0],
        tempCommandCards[1],
        [],
        [tempCommandCards[2]],
        [tempCommandCards[3]],
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
      const cardState = createCardState(
        [tempCommandCards[0], tempCommandCards[0]],
        [],
      );

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
        [tempCommandCards[0]],
        [],
        tempCommandCards[0],
        tempCommandCards[1],
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
      // Default cards: both players have tempCommandCards[0] awaitingPlay, tempCommandCards[1] inPlay
      const blackStartingHand = new Set([
        tempCommandCards[0],
        tempCommandCards[1],
        tempCommandCards[2],
      ]);
      const whiteStartingHand = cardSet(0, 1, 2);
      const cardState = createCardState(
        [tempCommandCards[2]],
        [tempCommandCards[2]],
      );

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
      const cardState = createCardState([tempCommandCards[0]], []);

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
      const cardState = createCardState([], [tempCommandCards[1]]);

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
      const cardState = createCardState([tempCommandCards[0]], []);

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
      const cardState = createCardState(
        [tempCommandCards[0], tempCommandCards[1]],
        [],
      );

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
        [tempCommandCards[0]],
        [],
        tempCommandCards[1],
        tempCommandCards[2],
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
        [tempCommandCards[0]],
        [],
        tempCommandCards[2],
        tempCommandCards[1],
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
        [tempCommandCards[0]],
        [],
        tempCommandCards[2],
        tempCommandCards[2],
        [tempCommandCards[1]],
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
        [tempCommandCards[0]],
        [],
        tempCommandCards[2],
        tempCommandCards[2],
        [],
        [tempCommandCards[1]],
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
        [tempCommandCards[0]],
        [],
        tempCommandCards[2],
        tempCommandCards[2],
        [],
        [],
        [tempCommandCards[1]],
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
