import type { Coordinate } from '@entities';
import {
  createEmptyGameState,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';
import { addUnitToBoard, createEmptyStandardBoard } from '@transforms';

import { getLegalSetupUnits } from './getLegalSetupUnits';
import { getSetupZoneCoordinates } from './getSetupZoneCoordinates';

/**
 * GetLegalSetupUnits: reserved units + empty setup-zone coordinates.
 */
describe(getLegalSetupUnits, () => {
  it('returns reserved units and empty zone coordinates for the player', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = {
      ...createEmptyGameState(),
      boardState: createEmptyStandardBoard(),
      reservedUnits: [unit],
    };

    const legal = getLegalSetupUnits(state, 'white');
    expect(legal).not.toBeNull();
    expect(legal?.units).toStrictEqual([unit]);
    expect(legal?.coordinates).toStrictEqual(
      getSetupZoneCoordinates(state.boardState, 'white'),
    );
  });

  it('omits occupied zone coordinates', () => {
    const reserved = createTestUnit('black', { attack: 2, instanceNumber: 1 });
    const blocker = createUnitWithPlacement({
      coordinate: 'L-3' as Coordinate,
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 2 },
    });
    const state = {
      ...createEmptyGameState(),
      boardState: addUnitToBoard(createEmptyStandardBoard(), blocker),
      reservedUnits: [reserved],
    };

    const legal = getLegalSetupUnits(state, 'black');
    expect(legal?.coordinates).not.toContain('L-3');
    expect(legal?.coordinates.length).toBe(
      getSetupZoneCoordinates(state.boardState, 'black').length - 1,
    );
  });

  it('returns null when the player has no reserved units', () => {
    const state = createEmptyGameState();
    expect(getLegalSetupUnits(state, 'white')).toBeNull();
  });
});
