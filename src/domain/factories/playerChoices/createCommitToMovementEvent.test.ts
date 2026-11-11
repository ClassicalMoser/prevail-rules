import { tempCommandCards } from '@sampleValues';
import type { MovementModifier } from '@events';

import { createCommitToMovementEvent } from './createCommitToMovementEvent';

describe('createCommitToMovementEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const committedCard = tempCommandCards[0];
    const modifierTypes: MovementModifier[] = ['speed', 'flexibility'];

    const event = createCommitToMovementEvent({
      committedCard,
      modifierTypes,
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'commitToMovement',
      committedCard,
      eventType: 'playerChoice',
      modifierTypes,
      player: 'white',
    });
  });
});
