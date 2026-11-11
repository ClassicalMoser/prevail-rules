import { createUnitWithPlacement } from '@testing';

import { createSetupUnitsEvent } from './createSetupUnitsEvent';

describe('createSetupUnitsEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const unitPlacements = [createUnitWithPlacement()];

    const event = createSetupUnitsEvent({
      commanderCoordinate: 'E-5',
      player: 'white',
      unitPlacements,
    });

    expect(event).toStrictEqual({
      choiceType: 'setupUnits',
      commanderCoordinate: 'E-5',
      eventType: 'playerChoice',
      player: 'white',
      unitPlacements,
    });
  });
});
