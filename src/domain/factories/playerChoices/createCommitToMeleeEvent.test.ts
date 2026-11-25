import { tempCommandCards } from '@sampleValues';
import { createCommitToMeleeEvent } from './createCommitToMeleeEvent';

describe('createCommitToMeleeEvent function', () => {
  it('fills in the event and choice types and keeps the rest', () => {
    const card = tempCommandCards[0];

    const event = createCommitToMeleeEvent({
      committedCard: card,
      player: 'black',
    });

    expect(event).toStrictEqual({
      choiceType: 'commitToMelee',
      committedCard: card,
      eventType: 'playerChoice',
      player: 'black',
    });
  });
});
