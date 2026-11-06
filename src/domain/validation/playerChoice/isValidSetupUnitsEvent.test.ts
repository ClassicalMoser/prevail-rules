import { createTestUnit, placed } from '@testing';
import {
  createEmptyGameState,
  createEmptyStandardBoard,
  createSetupUnitsEvent,
} from '@factories';

import { isValidSetupUnitsEvent } from './isValidSetupUnitsEvent';

/**
 * IsValidSetupUnitsEvent: reserved cover + setup-zone membership.
 */
describe('isValidSetupUnitsEvent function', () => {
  it('accepts placing all reserved units into empty zone spaces', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = {
      ...createEmptyGameState('standard'),
      boardState: createEmptyStandardBoard(),
      reservedUnits: [unit],
    };
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'A-3',
      eventNumber: 0,
      player: 'white',
      unitPlacements: [placed(unit, 'A-3', 'south')],
    });

    expect(isValidSetupUnitsEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts commander alone on an empty setup-zone coordinate', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = {
      ...createEmptyGameState('standard'),
      boardState: createEmptyStandardBoard(),
      reservedUnits: [unit],
    };
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'A-4',
      eventNumber: 0,
      player: 'white',
      unitPlacements: [placed(unit, 'A-3', 'south')],
    });

    expect(isValidSetupUnitsEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a coordinate outside the setup zone', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = {
      ...createEmptyGameState('standard'),
      boardState: createEmptyStandardBoard(),
      reservedUnits: [unit],
    };
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'E-5',
      eventNumber: 0,
      player: 'white',
      unitPlacements: [placed(unit, 'E-5', 'south')],
    });

    expect(isValidSetupUnitsEvent(event, state).result).toBe(false);
  });

  it('rejects when not all reserved units are placed', () => {
    const unit1 = createTestUnit('black', { attack: 2, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 2, instanceNumber: 2 });
    const state = {
      ...createEmptyGameState('standard'),
      boardState: createEmptyStandardBoard(),
      reservedUnits: [unit1, unit2],
    };
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'L-3',
      eventNumber: 0,
      player: 'black',
      unitPlacements: [placed(unit1, 'L-3', 'north')],
    });

    expect(isValidSetupUnitsEvent(event, state).result).toBe(false);
  });

  it('rejects commander outside the empty setup zone', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = {
      ...createEmptyGameState('standard'),
      boardState: createEmptyStandardBoard(),
      reservedUnits: [unit],
    };
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'E-5',
      eventNumber: 0,
      player: 'white',
      unitPlacements: [placed(unit, 'A-3', 'south')],
    });

    expect(isValidSetupUnitsEvent(event, state)).toMatchObject({
      result: false,
      errorReason: expect.stringContaining('Commander'),
    });
  });
});
