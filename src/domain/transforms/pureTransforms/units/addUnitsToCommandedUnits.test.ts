import { createEmptyGameState, createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { addUnitsToCommandedUnits } from './addUnitsToCommandedUnits';

describe('addUnitsToCommandedUnits', () => {
  it('should add units to commandedUnits set', () => {
    const state = createEmptyGameState();
    const unit1 = createTestUnit('black', { attack: 3 });
    const unit2 = createTestUnit('white', { attack: 4 });
    const units = new Set([unit1, unit2]);

    const newState = addUnitsToCommandedUnits(state, units);

    expect(newState.currentRoundState.commandedUnits).toEqual(units);
  });

  it('should not mutate the original state', () => {
    const state = createEmptyGameState();
    const unit = createTestUnit('black', { attack: 3 });
    const units = new Set([unit]);

    addUnitsToCommandedUnits(state, units);

    expect(state.currentRoundState.commandedUnits.size).toBe(0);
  });

  it('should add to existing commandedUnits', () => {
    const state = createEmptyGameState();
    const unit1 = createTestUnit('black', { attack: 2 });
    const unit2 = createTestUnit('white', { attack: 3 });
    const unit3 = createTestUnit('black', { attack: 4 });

    const stateWithUnit1 = addUnitsToCommandedUnits(state, new Set([unit1]));
    const newState = addUnitsToCommandedUnits(
      stateWithUnit1,
      new Set([unit2, unit3]),
    );

    expect(newState.currentRoundState.commandedUnits.size).toBe(3);
    expect(
      Array.from(newState.currentRoundState.commandedUnits).includes(unit1),
    ).toBe(true);
    expect(
      Array.from(newState.currentRoundState.commandedUnits).includes(unit2),
    ).toBe(true);
    expect(
      Array.from(newState.currentRoundState.commandedUnits).includes(unit3),
    ).toBe(true);
  });
});
