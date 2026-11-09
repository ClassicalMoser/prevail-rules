import { createChooseRetreatOptionEvent } from './createChooseRetreatOptionEvent';

describe('createChooseRetreatOptionEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    // The player names the way back by the moves it takes, not by where it ends.
    const path = ['turnLeft', 'step'] as const;

    const event = createChooseRetreatOptionEvent({
      eventNumber: 3,
      player: 'white',
      path: [...path],
    });

    expect(event).toStrictEqual({
      choiceType: 'chooseRetreatOption',
      eventNumber: 3,
      eventType: 'playerChoice',
      player: 'white',
      path: [...path],
    });
  });
});
