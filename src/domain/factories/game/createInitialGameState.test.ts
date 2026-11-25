/**
 * A new game: both armies in reserve, one instance per unit numbered from 1
 * within its type, and each army's command cards dealt into its own hand, on
 * the empty game of the mode.
 */

import type { Army } from '@entities';
import { createTestCard, createTestUnit } from '@testing';

import { createInitialGameState } from './createInitialGameState';

describe('createInitialGameState function', () => {
  // Any unit types will do: this suite counts and numbers the units dealt,
  // and never reads their stats.
  const whiteType = createTestUnit('white').unitType;
  const blackType = createTestUnit('black').unitType;

  const whiteArmy: Army = {
    commandCards: [],
    id: '10000000-0000-4000-8000-000000000001',
    name: 'White',
    units: [{ count: 2, unitType: whiteType }],
  };
  const blackArmy: Army = {
    commandCards: [],
    id: '20000000-0000-4000-8000-000000000002',
    name: 'Black',
    units: [{ count: 1, unitType: blackType }],
  };

  it('reserves one instance per count, numbered from 1', () => {
    const state = createInitialGameState({
      blackArmy,
      gameMode: 'mini',
      whiteArmy,
    });

    expect(state.reservedUnits).toHaveLength(3);
    expect(
      state.reservedUnits
        .filter((unit) => unit.playerSide === 'white')
        .map((unit) => unit.instanceNumber)
        .toSorted((a: number, b: number) => a - b),
    ).toStrictEqual([1, 2]);
    expect(
      state.reservedUnits.find((unit) => unit.playerSide === 'black')
        ?.instanceNumber,
    ).toBe(1);
  });

  it("deals each army's command cards into its own side's hand, as a copy", () => {
    const whiteCard = createTestCard();
    const blackCard = createTestCard();
    const armyWithCards: Army = {
      ...whiteArmy,
      commandCards: [whiteCard],
    };
    const blackWithCards: Army = {
      ...blackArmy,
      commandCards: [blackCard],
    };

    const state = createInitialGameState({
      blackArmy: blackWithCards,
      gameMode: 'mini',
      whiteArmy: armyWithCards,
    });

    expect(state.cardState.white.inHand).toStrictEqual([whiteCard]);
    expect(state.cardState.black.inHand).toStrictEqual([blackCard]);
    expect(state.cardState.white.inHand).not.toBe(armyWithCards.commandCards);
  });

  it('opens on the board of the mode it is given', () => {
    // The mode passes straight to the empty game, whose spec covers each
    // mode's board and the refusal of an unknown one; epic shows it arrives.
    const state = createInitialGameState({
      blackArmy,
      gameMode: 'epic',
      whiteArmy,
    });

    expect(state.boardState.boardType).toBe('large');
  });
});
