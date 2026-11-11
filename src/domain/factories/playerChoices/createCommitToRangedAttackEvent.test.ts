import { tempCommandCards } from '@sampleValues';
import type { RangedAttackModifier } from '@events';

import { createCommitToRangedAttackEvent } from './createCommitToRangedAttackEvent';

describe('createCommitToRangedAttackEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const committedCard = tempCommandCards[0];
    const modifierTypes: RangedAttackModifier[] = ['range', 'attack'];

    const event = createCommitToRangedAttackEvent({
      committedCard,
      modifierTypes,
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'commitToRangedAttack',
      committedCard,
      eventType: 'playerChoice',
      modifierTypes,
      player: 'white',
    });
  });
});
