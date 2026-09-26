/**
 * Initial game state deals both armies onto the empty shell for that mode.
 * Board size follows the same catalog as createEmptyGameState. Instance numbers
 * start at 1 per unit type. Command cards are copied into each hand.
 * A value outside GameModeName is rejected before any units are reserved.
 */

import type { Army } from '@entities';
import { createTestCard, createTestUnit } from '@testing';

import { createInitialGameState } from './createInitialGameState';

describe(createInitialGameState, () => {
  const whiteType = createTestUnit('white').unitType;
  const blackType = createTestUnit('black').unitType;

  const whiteArmy: Army = {
    commandCards: [],
    id: '00000010-0000-1234-0000-000000000001',
    units: [{ count: 2, unitType: whiteType }],
  };
  const blackArmy: Army = {
    commandCards: [],
    id: '00000020-0000-1234-0000-000000000002',
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

  it('copies each army hand instead of sharing the army array', () => {
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

  // Each mode builds the empty shell for that board size, then deals the same armies.
  it('uses the small board for tutorial', () => {
    const state = createInitialGameState({
      blackArmy,
      gameMode: 'tutorial',
      whiteArmy,
    });

    expect(state.boardState.boardType).toBe('small');
    expect(state.reservedUnits).toHaveLength(3);
  });

  it('uses the standard board for standard', () => {
    const state = createInitialGameState({
      blackArmy,
      gameMode: 'standard',
      whiteArmy,
    });

    expect(state.boardState.boardType).toBe('standard');
  });

  it('uses the large board for epic', () => {
    const state = createInitialGameState({
      blackArmy,
      gameMode: 'epic',
      whiteArmy,
    });

    expect(state.boardState.boardType).toBe('large');
  });

  it('rejects a mode outside the catalog', () => {
    // Intentional invalid mode so the exhaustive default stays aligned at runtime.
    const gameMode = 'skirmish' as never;

    expect(() =>
      createInitialGameState({
        blackArmy,
        gameMode,
        whiteArmy,
      }),
    ).toThrow('Unknown gameMode: skirmish');
  });
});
