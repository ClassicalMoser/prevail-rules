import { tempCommandCards } from '@sampleValues';
import { createChooseCardEvent } from './createChooseCardEvent';

describe('createChooseCardEvent function', () => {
  it('fills in the event and choice types and keeps the rest', () => {
    expect.hasAssertions();
    const card = tempCommandCards[0];

    const event = createChooseCardEvent({
      card,
      player: 'white',
    });

    expect(event).toStrictEqual({
      card,
      choiceType: 'chooseCard',
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});
