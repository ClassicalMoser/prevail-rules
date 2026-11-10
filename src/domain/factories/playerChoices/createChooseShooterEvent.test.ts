import { createUnitWithPlacement } from '@testing';

import { createChooseShooterEvent } from './createChooseShooterEvent';

describe('createChooseShooterEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    // Any unit will do: the factory only carries it, and judging whether it
    // may shoot is legality's job.
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });

    const event = createChooseShooterEvent({
      eventNumber: 2,
      player: 'black',
      unit,
    });

    expect(event).toStrictEqual({
      choiceType: 'chooseShooter',
      eventNumber: 2,
      eventType: 'playerChoice',
      player: 'black',
      unit,
    });
  });
});
