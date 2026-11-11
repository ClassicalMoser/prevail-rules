import { createChooseRallyEvent } from './createChooseRallyEvent';

describe('createChooseRallyEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();

    const event = createChooseRallyEvent({
      performRally: true,
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'chooseRally',
      eventType: 'playerChoice',
      performRally: true,
      player: 'white',
    });
  });
});
