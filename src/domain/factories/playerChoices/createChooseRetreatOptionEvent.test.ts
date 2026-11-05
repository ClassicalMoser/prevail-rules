import { createUnitPlacement } from '@factories/unitLocation';

import { createChooseRetreatOptionEvent } from './createChooseRetreatOptionEvent';

describe('createChooseRetreatOptionEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const retreatOption = createUnitPlacement('E-4', 'north');

    const event = createChooseRetreatOptionEvent({
      eventNumber: 3,
      player: 'white',
      retreatOption,
    });

    expect(event).toStrictEqual({
      choiceType: 'chooseRetreatOption',
      eventNumber: 3,
      eventType: 'playerChoice',
      player: 'white',
      retreatOption,
    });
  });
});
