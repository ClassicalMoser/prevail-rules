import { createUnitIndexKey } from '@factories';
import { createGameStateWithUnits, createTestUnit, placed } from '@testing';

import { moveUnitIntoEngagement } from './moveUnitIntoEngagement';

/**
 * A unit moves into a lone enemy's space and engages it, its space and its
 * entry in the index changing in one write.
 */
describe('moveUnitIntoEngagement function', () => {
  // White faces east at E-5; black stands at D-5, to its north, facing south.
  const defender = createTestUnit('white');
  const attacker = createTestUnit('black');
  const state = createGameStateWithUnits([
    placed(defender, 'E-5', 'east'),
    placed(attacker, 'D-5', 'south'),
  ]);

  it('lifts the attacker, pairs it with the defender, and files it there', () => {
    // Black engages from the north, facing south.
    const engaged = moveUnitIntoEngagement(state, attacker, {
      coordinate: 'E-5',
      facing: 'south',
    });

    // D-5 is empty; the pair stands on E-5 with the attacker's facing.
    expect(engaged.boardState.board['D-5']?.unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    expect(engaged.boardState.board['E-5']?.unitPresence).toStrictEqual({
      presenceType: 'engaged',
      primaryFacing: 'south',
      primaryUnit: attacker,
      secondaryUnit: defender,
    });
    // The attacker is filed at E-5; the defender never moved.
    expect(engaged.index.units[createUnitIndexKey(attacker)]).toBe('E-5');
    expect(engaged.index.units[createUnitIndexKey(defender)]).toBe('E-5');
  });

  it('engages with the unit the board held, however the unit was named', () => {
    // The board holds Black's unit as it was built; it is named claiming
    // Attack 99.
    const claimed = {
      ...attacker,
      unitType: {
        ...attacker.unitType,
        stats: { ...attacker.unitType.stats, attack: 99 },
      },
    };

    const engaged = moveUnitIntoEngagement(state, claimed, {
      coordinate: 'E-5',
      facing: 'south',
    });

    // The engaging unit on E-5 is the one the board held.
    expect(engaged.boardState.board['E-5']?.unitPresence).toStrictEqual({
      presenceType: 'engaged',
      primaryFacing: 'south',
      primaryUnit: attacker,
      secondaryUnit: defender,
    });
  });
});
