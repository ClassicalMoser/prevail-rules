import { createEmptyGameState, createTestUnit } from '@testing';

import { addUnitsToCommandedUnits } from './addUnitsToCommandedUnits';

/**
 * AddUnitsToCommandedUnits: Adds units to the commandedUnits set in the current round state.
 */
describe(addUnitsToCommandedUnits, () => {
  it('given add units to commandedUnits set', () => {
    const state = createEmptyGameState();
    const unit1 = createTestUnit('black', { attack: 3 });
    const unit2 = createTestUnit('white', { attack: 4 });
    const units = [unit1, unit2];

    const newState = addUnitsToCommandedUnits(state, units);

    expect(newState.currentRoundState.commandedUnits).toStrictEqual(units);
  });

  it('given not mutate the original state', () => {
    const state = createEmptyGameState();
    const unit = createTestUnit('black', { attack: 3 });
    const units = [unit];

    addUnitsToCommandedUnits(state, units);

    expect(state.currentRoundState.commandedUnits.length).toBe(0);
  });

  it('given add to existing commandedUnits', () => {
    const state = createEmptyGameState();
    const unit1 = createTestUnit('black', { attack: 2 });
    const unit2 = createTestUnit('white', { attack: 3 });
    const unit3 = createTestUnit('black', { attack: 4 });

    const stateWithUnit1 = addUnitsToCommandedUnits(state, [unit1]);
    const newState = addUnitsToCommandedUnits(stateWithUnit1, [unit2, unit3]);

    expect(newState.currentRoundState.commandedUnits.length).toBe(3);
    expect([...newState.currentRoundState.commandedUnits]).toContain(unit1);
    expect([...newState.currentRoundState.commandedUnits]).toContain(unit2);
    expect([...newState.currentRoundState.commandedUnits]).toContain(unit3);
  });
});
