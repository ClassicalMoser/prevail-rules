import { createChooseMeleeResolutionEvent } from './createChooseMeleeResolutionEvent';

describe('createChooseMeleeResolutionEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();

    const event = createChooseMeleeResolutionEvent({
      eventNumber: 3,
      player: 'white',
      space: 'E-5',
    });

    expect(event).toStrictEqual({
      choiceType: 'chooseMeleeResolution',
      eventNumber: 3,
      eventType: 'playerChoice',
      player: 'white',
      space: 'E-5',
    });
  });
});
