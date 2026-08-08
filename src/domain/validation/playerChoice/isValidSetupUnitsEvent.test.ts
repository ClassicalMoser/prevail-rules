import type { SetupUnitsEvent } from '@events';
import { createEmptyGameState, createTestUnit } from '@testing';
import { createEmptyStandardBoard } from '@transforms';

import { isValidSetupUnitsEvent } from './isValidSetupUnitsEvent';

/**
 * IsValidSetupUnitsEvent: reserved cover + setup-zone membership.
 */
describe(isValidSetupUnitsEvent, () => {
  it('accepts placing all reserved units into empty zone spaces', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = {
      ...createEmptyGameState(),
      boardState: createEmptyStandardBoard(),
      reservedUnits: [unit],
    };
    const event: SetupUnitsEvent = {
      choiceType: 'setupUnits',
      commanderCoordinate: 'A-3',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
      unitPlacements: [
        {
          placement: { coordinate: 'A-3', facing: 'south' },
          unit,
        },
      ],
    };

    expect(isValidSetupUnitsEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts commander alone on an empty setup-zone coordinate', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = {
      ...createEmptyGameState(),
      boardState: createEmptyStandardBoard(),
      reservedUnits: [unit],
    };
    const event: SetupUnitsEvent = {
      choiceType: 'setupUnits',
      commanderCoordinate: 'A-4',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
      unitPlacements: [
        {
          placement: { coordinate: 'A-3', facing: 'south' },
          unit,
        },
      ],
    };

    expect(isValidSetupUnitsEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a coordinate outside the setup zone', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = {
      ...createEmptyGameState(),
      boardState: createEmptyStandardBoard(),
      reservedUnits: [unit],
    };
    const event: SetupUnitsEvent = {
      choiceType: 'setupUnits',
      commanderCoordinate: 'E-5',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
      unitPlacements: [
        {
          placement: { coordinate: 'E-5', facing: 'south' },
          unit,
        },
      ],
    };

    expect(isValidSetupUnitsEvent(event, state).result).toBe(false);
  });

  it('rejects when not all reserved units are placed', () => {
    const unit1 = createTestUnit('black', { attack: 2, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 2, instanceNumber: 2 });
    const state = {
      ...createEmptyGameState(),
      boardState: createEmptyStandardBoard(),
      reservedUnits: [unit1, unit2],
    };
    const event: SetupUnitsEvent = {
      choiceType: 'setupUnits',
      commanderCoordinate: 'L-3',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
      unitPlacements: [
        {
          placement: { coordinate: 'L-3', facing: 'north' },
          unit: unit1,
        },
      ],
    };

    expect(isValidSetupUnitsEvent(event, state).result).toBe(false);
  });

  it('rejects commander outside the empty setup zone', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = {
      ...createEmptyGameState(),
      boardState: createEmptyStandardBoard(),
      reservedUnits: [unit],
    };
    const event: SetupUnitsEvent = {
      choiceType: 'setupUnits',
      commanderCoordinate: 'E-5',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
      unitPlacements: [
        {
          placement: { coordinate: 'A-3', facing: 'south' },
          unit,
        },
      ],
    };

    expect(isValidSetupUnitsEvent(event, state)).toMatchObject({
      result: false,
      errorReason: expect.stringContaining('Commander'),
    });
  });
});
