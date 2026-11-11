import { tempCommandCards } from '@sampleValues';
import { createCommitToMeleeEvent } from './createCommitToMeleeEvent';

describe('createCommitToMeleeEvent function', () => {
  it('fills in the event and choice types and keeps the rest', () => {
    expect.hasAssertions();
    const card = tempCommandCards[0];

    const event = createCommitToMeleeEvent({
      committedCard: card,
      modifierTypes: ['attack', 'defense'],
      player: 'black',
    });

    expect(event).toStrictEqual({
      choiceType: 'commitToMelee',
      committedCard: card,
      eventType: 'playerChoice',
      modifierTypes: ['attack', 'defense'],
      player: 'black',
    });
  });

  it('carries a refusal as a null card with no modifiers', () => {
    expect.hasAssertions();

    const event = createCommitToMeleeEvent({
      committedCard: null,
      modifierTypes: [],
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'commitToMelee',
      committedCard: null,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'white',
    });
  });
});
