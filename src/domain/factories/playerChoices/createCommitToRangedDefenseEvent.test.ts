import { createTestCard } from '@testing';

import { createCommitToRangedDefenseEvent } from './createCommitToRangedDefenseEvent';

describe('createCommitToRangedDefenseEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    // A Defence card, one a target may commit.
    const committedCard = createTestCard({ modifiers: ['defense'] });

    const event = createCommitToRangedDefenseEvent({
      committedCard,
      modifierTypes: ['defense'],
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'commitToRangedDefense',
      committedCard,
      eventType: 'playerChoice',
      modifierTypes: ['defense'],
      player: 'white',
    });
  });
});
