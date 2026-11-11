import { createMoveCommanderEvent } from './createMoveCommanderEvent';

describe('createMoveCommanderEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();

    const event = createMoveCommanderEvent({
      from: 'E-5',
      player: 'white',
      to: 'E-4',
    });

    expect(event).toStrictEqual({
      choiceType: 'moveCommander',
      eventType: 'playerChoice',
      from: 'E-5',
      player: 'white',
      to: 'E-4',
    });
  });
});
