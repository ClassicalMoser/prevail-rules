import { createUnitIndexKey } from '@factories';
import { createGameStateWithUnits, createTestUnit, placed } from '@testing';

import { routUnit } from './routUnit';

/**
 * A unit routs: off the board and among the routed in one write, so no state
 * has it both standing and routed.
 */
describe('routUnit function', () => {
  // Black's unit stands on E-5.
  const unit = createTestUnit('black', { attack: 3 });
  const state = createGameStateWithUnits([placed(unit, 'E-5', 'north')]);

  it('takes the unit off the board, among the routed, and files it as routed', () => {
    const routed = routUnit(state, unit);

    // E-5 is empty, the unit is routed, and the index says so.
    expect(routed.boardState.board['E-5']?.unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    expect(routed.routedUnits).toStrictEqual([unit]);
    expect(routed.index.units[createUnitIndexKey(unit)]).toBe('routed');
  });

  it('routs the unit the board held, however the unit was named', () => {
    // The board holds the unit with Attack 3; it is named claiming Attack 99.
    const claimed = {
      ...unit,
      unitType: {
        ...unit.unitType,
        stats: { ...unit.unitType.stats, attack: 99 },
      },
    };

    const routed = routUnit(state, claimed);

    // The unit among the routed is the one the board held.
    expect(routed.routedUnits).toStrictEqual([unit]);
  });

  it('throws for a unit that has already routed', () => {
    // The unit routed once, and is named to rout again.
    const routedOnce = routUnit(state, unit);

    // A unit routs once (§9.3.1); a second rout is a fault in whatever named it.
    expect(() => routUnit(routedOnce, unit)).toThrow('Unit already routed');
  });

  it('throws for a unit not on the board', () => {
    // A unit nowhere on the board cannot rout from it.
    const absent = createTestUnit('white', { attack: 3 });

    expect(() => routUnit(state, absent)).toThrow('Unit not found on board');
  });
});
