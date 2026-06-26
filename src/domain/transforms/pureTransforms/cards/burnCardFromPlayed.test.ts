import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { burnCardFromPlayed } from './burnCardFromPlayed';

/**
 * BurnCardFromPlayed: Burns a specific card from the player's played pile.
 */
describe(burnCardFromPlayed, () => {
  it('given move card from played to burnt', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      burnt: [],
      played: [tempCommandCards[0], tempCommandCards[1]],
    };

    const result = burnCardFromPlayed(owned, tempCommandCards[0]);

    expect(result.played).toStrictEqual([tempCommandCards[1]]);
    expect(result.burnt).toStrictEqual([tempCommandCards[0]]);
  });

  it('given if card is not in played pile, throws', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      burnt: [],
      played: [tempCommandCards[0]],
    };

    expect(() => burnCardFromPlayed(owned, tempCommandCards[1])).toThrow(
      `Card ${tempCommandCards[1].id} not found in player's played cards`,
    );
  });

  it('given not mutate the original card state', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      burnt: [],
      played: [tempCommandCards[0]],
    };
    const originalPlayed = owned.played;
    const originalBurnt = owned.burnt;

    burnCardFromPlayed(owned, tempCommandCards[0]);

    expect(owned.played).toBe(originalPlayed);
    expect(owned.burnt).toBe(originalBurnt);
  });

  it('given append to existing burnt cards', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      burnt: [tempCommandCards[2]],
      played: [tempCommandCards[0], tempCommandCards[1]],
    };

    const result = burnCardFromPlayed(owned, tempCommandCards[0]);

    expect(result.burnt).toStrictEqual([
      tempCommandCards[2],
      tempCommandCards[0],
    ]);
  });
});
