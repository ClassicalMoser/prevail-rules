import { createDoneIssuingCommandsEvent } from './createDoneIssuingCommandsEvent';

describe('createDoneIssuingCommandsEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();

    const event = createDoneIssuingCommandsEvent({
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'doneIssuingCommands',
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});
