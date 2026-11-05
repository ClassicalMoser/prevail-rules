import { createDoneIssuingCommandsEvent } from './createDoneIssuingCommandsEvent';

describe('createDoneIssuingCommandsEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();

    const event = createDoneIssuingCommandsEvent({
      eventNumber: 3,
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'doneIssuingCommands',
      eventNumber: 3,
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});
