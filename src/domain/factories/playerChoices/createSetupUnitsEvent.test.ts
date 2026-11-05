import { createUnitWithPlacement } from '@testing';

import { createSetupUnitsEvent } from './createSetupUnitsEvent';

describe('createSetupUnitsEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const unitPlacements = [createUnitWithPlacement()];

    const event = createSetupUnitsEvent({
      commanderCoordinate: 'E-5',
      eventNumber: 3,
      player: 'white',
      unitPlacements,
    });

    expect(event).toStrictEqual({
      choiceType: 'setupUnits',
      commanderCoordinate: 'E-5',
      eventNumber: 3,
      eventType: 'playerChoice',
      player: 'white',
      unitPlacements,
    });
  });
});
