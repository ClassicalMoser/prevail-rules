import { createTestUnit } from '@testing';

import { createChooseMovingUnitEvent } from './createChooseMovingUnitEvent';

describe('createChooseMovingUnitEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    // Any unit will do: the factory only carries it, by who it is.
    const unit = createTestUnit('black');

    const event = createChooseMovingUnitEvent({
      player: 'black',
      unit,
    });

    expect(event).toStrictEqual({
      choiceType: 'chooseMovingUnit',
      eventType: 'playerChoice',
      player: 'black',
      unit,
    });
  });
});
