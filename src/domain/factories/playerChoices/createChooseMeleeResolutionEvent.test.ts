import { createChooseMeleeResolutionEvent } from './createChooseMeleeResolutionEvent';

describe('createChooseMeleeResolutionEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();

    const event = createChooseMeleeResolutionEvent({
      player: 'white',
      space: 'E-5',
    });

    expect(event).toStrictEqual({
      choiceType: 'chooseMeleeResolution',
      eventType: 'playerChoice',
      player: 'white',
      space: 'E-5',
    });
  });
});
