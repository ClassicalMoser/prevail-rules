import { createMoveUnitEvent } from './createMoveUnitEvent';

describe('createMoveUnitEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    // A path the factory carries through as given; it does not judge it.
    const event = createMoveUnitEvent({
      eventNumber: 3,
      moveCommander: true,
      path: ['turnRight', 'step'],
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'moveUnit',
      eventNumber: 3,
      eventType: 'playerChoice',
      moveCommander: true,
      path: ['turnRight', 'step'],
      player: 'white',
    });
  });
});
