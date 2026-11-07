import type { MovementModifier } from '@events';
import { tempCommandCards } from '@testing';

import { createCommitToMovementEvent } from './createCommitToMovementEvent';

describe('createCommitToMovementEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const committedCard = tempCommandCards[0];
    const modifierTypes: MovementModifier[] = ['speed', 'flexibility'];

    const event = createCommitToMovementEvent({
      committedCard,
      eventNumber: 3,
      modifierTypes,
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'commitToMovement',
      committedCard,
      eventNumber: 3,
      eventType: 'playerChoice',
      modifierTypes,
      player: 'white',
    });
  });
});
