import { createChooseRoutDiscardEvent } from './createChooseRoutDiscardEvent';

describe('createChooseRoutDiscardEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const cardIds = ['card-1'];

    const event = createChooseRoutDiscardEvent({
      cardIds,
      player: 'white',
    });

    expect(event).toStrictEqual({
      cardIds,
      choiceType: 'chooseRoutDiscard',
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});
