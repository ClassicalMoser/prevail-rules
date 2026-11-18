import { tempCommandCards } from '@sampleValues';
import { discardCardsFromHand } from './discardCardsFromHand';

import { createEmptyGameState } from '@factories';
/**
 * DiscardCardsFromHand: Pure transform to move specified cards from hand to discarded pile.
 */
describe('discardCardsFromHand function', () => {
  it('given move cards from hand to discarded', () => {
    const owned = {
      ...createEmptyGameState('standard').cardState.black,
      discarded: [],
      inHand: [tempCommandCards[0], tempCommandCards[1], tempCommandCards[2]],
    };

    const result = discardCardsFromHand(owned, [
      tempCommandCards[0].id,
      tempCommandCards[2].id,
    ]);

    expect(result.inHand).toStrictEqual([tempCommandCards[1]]);
    expect(result.discarded).toStrictEqual([
      tempCommandCards[0],
      tempCommandCards[2],
    ]);
  });

  it('lays the cards on the discard pile in the order they are named, not the order they were held', () => {
    // Black holds three cards, and names the last before the first.
    const owned = {
      ...createEmptyGameState('standard').cardState.black,
      discarded: [],
      inHand: [tempCommandCards[0], tempCommandCards[1], tempCommandCards[2]],
    };

    const result = discardCardsFromHand(owned, [
      tempCommandCards[2].id,
      tempCommandCards[0].id,
    ]);

    // The pile follows the choice, as a seat that cannot see Black's hand
    // lays the shown cards down, so every view of the pile agrees.
    expect(result.discarded).toStrictEqual([
      tempCommandCards[2],
      tempCommandCards[0],
    ]);
    // The card not named stays in hand.
    expect(result.inHand).toStrictEqual([tempCommandCards[1]]);
  });

  it('given not mutate the original card state', () => {
    const owned = {
      ...createEmptyGameState('standard').cardState.black,
      discarded: [],
      inHand: [tempCommandCards[0], tempCommandCards[1]],
    };
    const originalHand = owned.inHand;
    const originalDiscarded = owned.discarded;

    discardCardsFromHand(owned, [tempCommandCards[0].id]);

    expect(owned.inHand).toBe(originalHand);
    expect(owned.discarded).toBe(originalDiscarded);
  });

  it('given append to existing discarded cards', () => {
    const owned = {
      ...createEmptyGameState('standard').cardState.black,
      discarded: [tempCommandCards[2]],
      inHand: [tempCommandCards[0], tempCommandCards[1]],
    };

    const result = discardCardsFromHand(owned, [tempCommandCards[0].id]);

    expect(result.discarded).toStrictEqual([
      tempCommandCards[2],
      tempCommandCards[0],
    ]);
  });

  it('given handle multiple cards', () => {
    const owned = {
      ...createEmptyGameState('standard').cardState.black,
      discarded: [],
      inHand: [tempCommandCards[0], tempCommandCards[1], tempCommandCards[2]],
    };

    const result = discardCardsFromHand(owned, [
      tempCommandCards[0].id,
      tempCommandCards[1].id,
      tempCommandCards[2].id,
    ]);

    expect(result.inHand).toStrictEqual([]);
    expect(result.discarded).toStrictEqual([
      tempCommandCards[0],
      tempCommandCards[1],
      tempCommandCards[2],
    ]);
  });
});
