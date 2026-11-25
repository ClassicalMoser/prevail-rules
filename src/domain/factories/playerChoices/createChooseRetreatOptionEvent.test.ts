import type { MoveDelta } from '@entities';

import { createChooseRetreatOptionEvent } from './createChooseRetreatOptionEvent';

describe('createChooseRetreatOptionEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    // The player names the way back by the moves it takes, not by where it ends.
    const path: MoveDelta[] = ['turnLeft', 'step'];

    const event = createChooseRetreatOptionEvent({
      player: 'white',
      path,
    });

    expect(event).toStrictEqual({
      choiceType: 'chooseRetreatOption',
      eventType: 'playerChoice',
      player: 'white',
      path: ['turnLeft', 'step'],
    });
  });
});
