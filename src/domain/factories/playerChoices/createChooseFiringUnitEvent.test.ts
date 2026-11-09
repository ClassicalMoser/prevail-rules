import { createUnitWithPlacement } from '@testing';

import { createChooseFiringUnitEvent } from './createChooseFiringUnitEvent';

describe('createChooseFiringUnitEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    // Any unit will do: the factory only carries it, and judging whether it
    // may fire is legality's job.
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });

    const event = createChooseFiringUnitEvent({
      eventNumber: 2,
      player: 'black',
      unit,
    });

    expect(event).toStrictEqual({
      choiceType: 'chooseFiringUnit',
      eventNumber: 2,
      eventType: 'playerChoice',
      player: 'black',
      unit,
    });
  });
});
