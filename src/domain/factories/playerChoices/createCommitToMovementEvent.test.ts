import { tempCommandCards } from '@sampleValues';

import { createCommitToMovementEvent } from './createCommitToMovementEvent';

describe('createCommitToMovementEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const committedCard = tempCommandCards[0];

    const event = createCommitToMovementEvent({
      committedCard,
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'commitToMovement',
      committedCard,
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});
