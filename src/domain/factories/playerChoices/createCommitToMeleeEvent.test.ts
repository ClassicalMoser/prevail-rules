import { tempCommandCards } from '@sampleValues';

import { createCommitToMeleeEvent } from './createCommitToMeleeEvent';

describe('createCommitToMeleeEvent function', () => {
  it('fills in the event and choice types and keeps the rest', () => {
    expect.hasAssertions();
    const card = tempCommandCards[0];

    const event = createCommitToMeleeEvent({
      committedCard: card,
      eventNumber: 2,
      modifierTypes: ['attack', 'defense'],
      player: 'black',
    });

    expect(event).toStrictEqual({
      choiceType: 'commitToMelee',
      committedCard: card,
      eventNumber: 2,
      eventType: 'playerChoice',
      modifierTypes: ['attack', 'defense'],
      player: 'black',
    });
  });

  it('carries a refusal as a null card with no modifiers', () => {
    expect.hasAssertions();

    const event = createCommitToMeleeEvent({
      committedCard: null,
      eventNumber: 0,
      modifierTypes: [],
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'commitToMelee',
      committedCard: null,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'white',
    });
  });
});
