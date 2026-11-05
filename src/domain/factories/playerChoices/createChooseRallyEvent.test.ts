import { createChooseRallyEvent } from './createChooseRallyEvent';

describe('createChooseRallyEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();

    const event = createChooseRallyEvent({
      eventNumber: 3,
      performRally: true,
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'chooseRally',
      eventNumber: 3,
      eventType: 'playerChoice',
      performRally: true,
      player: 'white',
    });
  });
});
