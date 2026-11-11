import { tempCommandCards } from '@sampleValues';

import { createCommitToRangedAttackEvent } from './createCommitToRangedAttackEvent';

describe('createCommitToRangedAttackEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const committedCard = tempCommandCards[0];

    const event = createCommitToRangedAttackEvent({
      committedCard,
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'commitToRangedAttack',
      committedCard,
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});
