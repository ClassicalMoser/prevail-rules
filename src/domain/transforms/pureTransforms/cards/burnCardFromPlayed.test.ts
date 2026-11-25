import { tempCommandCards } from '@sampleValues';
import { burnCardFromPlayed } from './burnCardFromPlayed';

import { createEmptyGameState, createOwnedCardState } from '@factories';
/**
 * BurnCardFromPlayed: Burns a specific card from the player's played pile.
 */
describe('burnCardFromPlayed function', () => {
  it('given move card from played to burnt', () => {
    const owned = {
      ...createEmptyGameState('standard').cardState.black,
      burnt: [],
      played: [tempCommandCards[0], tempCommandCards[1]],
    };

    const result = burnCardFromPlayed(owned, tempCommandCards[0]);

    expect(result.played).toStrictEqual([tempCommandCards[1]]);
    expect(result.burnt).toStrictEqual([tempCommandCards[0]]);
  });

  it('burns the played pile’s own copy, not the copy the rally names', () => {
    // Black has played one card; the rally names it, who it is, under
    // another name.
    const played = tempCommandCards[0];
    const owned = createOwnedCardState({ played: [played] });
    const named = { ...played, name: 'Renamed' };

    const result = burnCardFromPlayed(owned, named);

    // The card burnt is the one that was played, as it prints.
    expect(result.burnt).toStrictEqual([played]);
  });

  it('given if card is not in played pile, throws', () => {
    const owned = {
      ...createEmptyGameState('standard').cardState.black,
      burnt: [],
      played: [tempCommandCards[0]],
    };

    expect(() => burnCardFromPlayed(owned, tempCommandCards[1])).toThrow(
      `Command card ${tempCommandCards[1].id} not found in player's played cards`,
    );
  });

  it('given not mutate the original card state', () => {
    const owned = {
      ...createEmptyGameState('standard').cardState.black,
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
      ...createEmptyGameState('standard').cardState.black,
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
