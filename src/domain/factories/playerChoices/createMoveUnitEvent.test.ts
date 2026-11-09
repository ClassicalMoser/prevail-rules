import { createUnitWithPlacement } from '@testing';

import { createMoveUnitEvent } from './createMoveUnitEvent';

describe('createMoveUnitEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });

    // A path the factory carries through as given; it does not judge it.
    const event = createMoveUnitEvent({
      eventNumber: 3,
      moveCommander: true,
      path: ['turnRight', 'step'],
      player: 'white',
      unit,
    });

    expect(event).toStrictEqual({
      choiceType: 'moveUnit',
      eventNumber: 3,
      eventType: 'playerChoice',
      moveCommander: true,
      path: ['turnRight', 'step'],
      player: 'white',
      unit,
    });
  });
});
