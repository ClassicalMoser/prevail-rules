import { createUnitWithPlacement } from '@testing';

import { createChooseMovingUnitEvent } from './createChooseMovingUnitEvent';

describe('createChooseMovingUnitEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    // Any unit will do: the factory only carries it.
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });

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
