import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { moveCardToPlayed } from './moveCardToPlayed';

/**
 * MoveCardToPlayed: Moves a player's card from inPlay to played pile.
 */
describe(moveCardToPlayed, () => {
  it('given move card from inPlay to played', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      inPlay: tempCommandCards[0],
      played: [],
    };

    const result = moveCardToPlayed(owned);

    expect(result.inPlay).toBeNull();
    expect(result.played).toStrictEqual([tempCommandCards[0]]);
  });

  it('given append to existing played cards', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      inPlay: tempCommandCards[1],
      played: [tempCommandCards[0]],
    };

    const result = moveCardToPlayed(owned);

    expect(result.played).toStrictEqual([
      tempCommandCards[0],
      tempCommandCards[1],
    ]);
  });

  it('given context, returns unchanged state if no card in play', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      inPlay: null,
      played: [],
    };

    const result = moveCardToPlayed(owned);

    expect(result).toBe(owned);
    expect(result.inPlay).toBeNull();
    expect(result.played).toStrictEqual([]);
  });

  it('given not mutate the original card state', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      inPlay: tempCommandCards[0],
      played: [],
    };
    const originalInPlay = owned.inPlay;
    const originalPlayed = owned.played;

    moveCardToPlayed(owned);

    expect(owned.inPlay).toBe(originalInPlay);
    expect(owned.played).toBe(originalPlayed);
  });
});
