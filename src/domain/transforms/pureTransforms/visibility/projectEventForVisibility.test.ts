import type { ChooseCardEvent, RevealCardsEvent } from '@events';
import { tempCommandCards } from '@sampleValues';

import { projectEventForVisibility } from './projectEventForVisibility';

describe(projectEventForVisibility, () => {
  const chooseCard: ChooseCardEvent = {
    card: tempCommandCards[0],
    choiceType: 'chooseCard',
    eventNumber: 0,
    eventType: 'playerChoice',
    player: 'white',
  };

  it('keeps full chooseCard for the acting seat', () => {
    expect(projectEventForVisibility(chooseCard, 'white')).toStrictEqual(
      chooseCard,
    );
  });

  it('redacts chooseCard card for the opposing seat', () => {
    expect(projectEventForVisibility(chooseCard, 'black')).toStrictEqual({
      ...chooseCard,
      card: 'hidden',
    });
  });

  it('passes revealCards through unchanged', () => {
    const reveal: RevealCardsEvent = {
      black: tempCommandCards[1],
      effectType: 'revealCards',
      eventNumber: 2,
      eventType: 'gameEffect',
      white: tempCommandCards[0],
    };

    expect(projectEventForVisibility(reveal, 'black')).toStrictEqual(reveal);
    expect(projectEventForVisibility(reveal, 'white')).toStrictEqual(reveal);
  });
});
