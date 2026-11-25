import { createEmptyGameState } from '@factories';
import { createTestUnit, placed, withReservedUnits } from '@testing';
import { deployUnit } from '@transforms';

import { getLegalSetupUnits } from './getLegalSetupUnits';

/**
 * GetLegalSetupUnits: reserved units + empty setup-zone coordinates.
 *
 * Each side places its whole army at once, one unit to a space, in its own
 * zone (§3.5.1). On a bare board the zone is the three rows nearest the
 * side's edge, less the two columns at each end (§3.5.4). These cases play
 * a Mini game, on the small board: White's zone is rows A to C and Black's
 * rows F to H, each from column 3 to column 10.
 */
describe('getLegalSetupUnits function', () => {
  // One stand-in unit for White, two for Black, all waiting in reserve.
  const whiteUnit = createTestUnit('white', { attack: 2 });
  const blackFirst = createTestUnit('black', { attack: 2, instanceNumber: 1 });
  const blackSecond = createTestUnit('black', {
    attack: 2,
    instanceNumber: 2,
  });
  const beforeDeployment = withReservedUnits(createEmptyGameState('mini'), [
    whiteUnit,
    blackFirst,
    blackSecond,
  ]);

  it('offers only the asked side’s units in reserve, and every space of its empty zone', () => {
    const legal = getLegalSetupUnits(beforeDeployment, 'white');

    // Black's units wait in the same reserve but are Black's to place.
    // White's zone is the 24 spaces of its three rows, columns 3 to 10.
    expect(legal).toStrictEqual({
      coordinates: [
        'A-3',
        'A-4',
        'A-5',
        'A-6',
        'A-7',
        'A-8',
        'A-9',
        'A-10',
        'B-3',
        'B-4',
        'B-5',
        'B-6',
        'B-7',
        'B-8',
        'B-9',
        'B-10',
        'C-3',
        'C-4',
        'C-5',
        'C-6',
        'C-7',
        'C-8',
        'C-9',
        'C-10',
      ],
      player: 'white',
      units: [whiteUnit],
    });
  });

  it('does not offer a space of the zone that already holds a unit', () => {
    // One of Black's units already stands on H-3; the other waits.
    const oneDeployed = deployUnit(
      beforeDeployment,
      placed(blackFirst, 'H-3', 'north'),
    );

    const legal = getLegalSetupUnits(oneDeployed, 'black');

    // One unit to a space (§3.5.1): the 24 spaces of Black's zone less H-3.
    expect(legal.units).toStrictEqual([blackSecond]);
    expect(legal.coordinates).not.toContain('H-3');
    expect(legal.coordinates).toHaveLength(23);
  });

  it('throws for a side with nothing left to place, which is never asked to set up', () => {
    // A side whose army is all on the board has set up already; the
    // sequencer asks only a side with units in reserve.
    const state = createEmptyGameState('standard');

    expect(() => getLegalSetupUnits(state, 'white')).toThrow(
      'white has no units left to place',
    );
  });
});
