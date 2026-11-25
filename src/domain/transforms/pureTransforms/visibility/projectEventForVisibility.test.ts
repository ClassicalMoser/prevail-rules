import { tempCommandCards } from '@sampleValues';
import type { ChooseCardEvent, RevealCardsEvent } from '@events';

import { projectEventForVisibility } from './projectEventForVisibility';

/**
 * A card laid face down in Phase 1 is secret from everyone but its owner
 * until both are revealed (§4.1.1); every other event is open to all (§1.4).
 */
describe('projectEventForVisibility function', () => {
  // White lays a card face down for the round.
  const chooseCard: ChooseCardEvent = {
    card: tempCommandCards[0],
    choiceType: 'chooseCard',
    eventType: 'playerChoice',
    player: 'white',
  };

  it('keeps full chooseCard for the acting seat', () => {
    // White sees the card it chose.
    expect(projectEventForVisibility(chooseCard, 'white')).toStrictEqual(
      chooseCard,
    );
  });

  it('redacts chooseCard card for the opposing seat', () => {
    // Black learns only that white chose a card.
    expect(projectEventForVisibility(chooseCard, 'black')).toStrictEqual({
      ...chooseCard,
      card: 'hidden',
    });
  });

  it('redacts chooseCard card for a spectator', () => {
    // Black lays its card face down too.
    const blackChooseCard: ChooseCardEvent = {
      ...chooseCard,
      player: 'black',
    };

    // A spectator holds neither hand, so neither card is in view.
    expect(projectEventForVisibility(chooseCard, 'spectator')).toStrictEqual({
      ...chooseCard,
      card: 'hidden',
    });
    expect(
      projectEventForVisibility(blackChooseCard, 'spectator'),
    ).toStrictEqual({
      ...blackChooseCard,
      card: 'hidden',
    });
  });

  it('keeps an opponent commit card', () => {
    // White commits a card to a move.
    const commit = {
      choiceType: 'commitToMovement' as const,
      committedCard: tempCommandCards[0],
      eventType: 'playerChoice' as const,
      player: 'white' as const,
    };

    // A committed card is revealed as it is committed (§1.4), so black and a
    // spectator read it whole.
    expect(projectEventForVisibility(commit, 'black')).toStrictEqual(commit);
    expect(projectEventForVisibility(commit, 'spectator')).toStrictEqual(
      commit,
    );
  });

  it('passes revealCards through unchanged', () => {
    // Both cards turned face up together (§4.1.2).
    const reveal: RevealCardsEvent = {
      black: tempCommandCards[1],
      effectType: 'revealCards',
      eventType: 'gameEffect',
      white: tempCommandCards[0],
    };

    // Once revealed, every view reads both cards.
    expect(projectEventForVisibility(reveal, 'black')).toStrictEqual(reveal);
    expect(projectEventForVisibility(reveal, 'white')).toStrictEqual(reveal);
    expect(projectEventForVisibility(reveal, 'spectator')).toStrictEqual(
      reveal,
    );
  });
});
