import { createChooseRoutDiscardEvent } from './createChooseRoutDiscardEvent';

describe('createChooseRoutDiscardEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const cardIds = ['card-1'];

    const event = createChooseRoutDiscardEvent({
      cardIds,
      eventNumber: 3,
      player: 'white',
    });

    expect(event).toStrictEqual({
      cardIds,
      choiceType: 'chooseRoutDiscard',
      eventNumber: 3,
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});
