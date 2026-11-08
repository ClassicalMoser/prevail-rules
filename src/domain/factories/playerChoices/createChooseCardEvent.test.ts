import { tempCommandCards } from '@sampleValues';
import { createChooseCardEvent } from './createChooseCardEvent';

describe('createChooseCardEvent function', () => {
  it('fills in the event and choice types and keeps the rest', () => {
    expect.hasAssertions();
    const card = tempCommandCards[0];

    const event = createChooseCardEvent({
      card,
      eventNumber: 3,
      player: 'white',
    });

    expect(event).toStrictEqual({
      card,
      choiceType: 'chooseCard',
      eventNumber: 3,
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});
