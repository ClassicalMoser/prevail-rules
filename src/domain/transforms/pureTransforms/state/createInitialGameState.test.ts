import type { Army } from '@entities';
import { createTestCard, createTestUnit } from '@testing';

import { createInitialGameState } from './createInitialGameState';

/**
 * Seeds reservedUnits from army unit counts. Instance numbers are 1-indexed;
 * card hands are intentionally left to the caller.
 */
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

  it('creates one reserved unit per count with instance numbers starting at 1', () => {
    const state = createInitialGameState({
      blackArmy,
      gameMode: 'mini',
      whiteArmy,
    });

    expect(state.reservedUnits).toHaveLength(3);
    expect(
      state.reservedUnits
        .filter((u) => u.playerSide === 'white')
        .map((u) => u.instanceNumber)
        .toSorted((a: number, b: number) => a - b),
    ).toStrictEqual([1, 2]);
    expect(
      state.reservedUnits.find((u) => u.playerSide === 'black')?.instanceNumber,
    ).toBe(1);
  });

  it('does not deal army command cards into either hand', () => {
    const armyWithCards: Army = {
      ...whiteArmy,
      commandCards: [createTestCard()],
    };

    const state = createInitialGameState({
      blackArmy,
      gameMode: 'mini',
      whiteArmy: armyWithCards,
    });

    expect(state.cardState.white.inHand).toStrictEqual([]);
    expect(state.cardState.black.inHand).toStrictEqual([]);
  });
});
