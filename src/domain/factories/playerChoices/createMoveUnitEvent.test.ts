import { createUnitPlacement } from '@factories/unitLocation';
import { createUnitWithPlacement } from '@testing';

import { createMoveUnitEvent } from './createMoveUnitEvent';

describe('createMoveUnitEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const to = createUnitPlacement('E-4', 'north');
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });

    const event = createMoveUnitEvent({
      eventNumber: 3,
      moveCommander: true,
      player: 'white',
      to,
      unit,
    });

    expect(event).toStrictEqual({
      choiceType: 'moveUnit',
      eventNumber: 3,
      eventType: 'playerChoice',
      moveCommander: true,
      player: 'white',
      to,
      unit,
    });
  });
});
