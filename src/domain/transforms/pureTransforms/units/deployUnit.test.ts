import { createEmptyGameState, createUnitIndexKey } from '@factories';
import { createTestUnit, placed } from '@testing';

import { deployUnit } from './deployUnit';

/**
 * A unit deploys (§3.5): out of the reserve and onto its space in one write,
 * so no state has it in both.
 */
describe('deployUnit function', () => {
  // White's one unit, waiting in reserve and filed there.
  const unit = createTestUnit('white', { attack: 3 });
  const waiting = {
    ...createEmptyGameState('standard'),
    index: {
      commanders: { black: 'reserved' as const, white: 'reserved' as const },
      units: { [createUnitIndexKey(unit)]: 'reserved' as const },
    },
    reservedUnits: [unit],
  };

  it('takes the unit out of reserve, places it, and files it where it stands', () => {
    const deployed = deployUnit(waiting, placed(unit, 'L-5', 'north'));

    // On L-5 facing north, the reserve empty, the index at L-5.
    expect(deployed.boardState.board['L-5']?.unitPresence).toStrictEqual({
      facing: 'north',
      presenceType: 'single',
      unit,
    });
    expect(deployed.reservedUnits).toStrictEqual([]);
    expect(deployed.index.units[createUnitIndexKey(unit)]).toBe('L-5');
  });

  it('throws for a unit not in reserve', () => {
    // Another white unit of the same type, never in reserve.
    const stranger = createTestUnit('white', { attack: 3, instanceNumber: 2 });

    expect(() => deployUnit(waiting, placed(stranger, 'L-5', 'north'))).toThrow(
      'Unit not present in reserve',
    );
  });
});
