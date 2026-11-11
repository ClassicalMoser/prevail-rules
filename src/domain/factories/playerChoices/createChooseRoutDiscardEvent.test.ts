import { createTestCard } from '@testing';

import { createChooseRoutDiscardEvent } from './createChooseRoutDiscardEvent';

describe('createChooseRoutDiscardEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const cards = [createTestCard()];

    const event = createChooseRoutDiscardEvent({
      cards,
      player: 'white',
    });

    expect(event).toStrictEqual({
      cards,
      choiceType: 'chooseRoutDiscard',
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});
