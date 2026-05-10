import type { CardState } from '@entities';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { chooseCard } from './chooseCard';

/**
 * ChooseCard: Moves a card from a player's hand to awaitingPlay (choosing a card for play).
 */
describe(chooseCard, () => {
  function cardStateWithHands(
    blackHand: typeof tempCommandCards,
    whiteHand: typeof tempCommandCards,
  ): CardState {
    const state = createEmptyGameState();
    return {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        awaitingPlay: null,
        inHand: [...blackHand],
      },
      white: {
        ...state.cardState.white,
        awaitingPlay: null,
        inHand: [...whiteHand],
      },
    };
  }

  it('moves card from black hand to awaitingPlay', () => {
    const cardState = cardStateWithHands(
      [tempCommandCards[0], tempCommandCards[1]],
      [tempCommandCards[2]],
    );

    const result = chooseCard(cardState, 'black', tempCommandCards[0]);

    expect(result.black.inHand).toStrictEqual([tempCommandCards[1]]);
    expect(result.black.awaitingPlay).toBe(tempCommandCards[0]);
    expect(result.white.inHand).toStrictEqual([tempCommandCards[2]]);
    expect(result.white.awaitingPlay).toBeNull();
  });

  it('moves card from white hand to awaitingPlay', () => {
    const cardState = cardStateWithHands(
      [tempCommandCards[0]],
      [tempCommandCards[1], tempCommandCards[2]],
    );

    const result = chooseCard(cardState, 'white', tempCommandCards[1]);

    expect(result.white.inHand).toStrictEqual([tempCommandCards[2]]);
    expect(result.white.awaitingPlay).toBe(tempCommandCards[1]);
    expect(result.black.inHand).toStrictEqual([tempCommandCards[0]]);
    expect(result.black.awaitingPlay).toBeNull();
  });

  it('throws when card not in black player hand', () => {
    const cardState = cardStateWithHands(
      [tempCommandCards[0]],
      [tempCommandCards[1]],
    );
    const cardNotInBlackHand = tempCommandCards[1];

    expect(() => chooseCard(cardState, 'black', cardNotInBlackHand)).toThrow(
      `Card ${tempCommandCards[1].id} not found in Black player's hand`,
    );
  });

  it('throws when card not in white player hand', () => {
    const cardState = cardStateWithHands(
      [tempCommandCards[0]],
      [tempCommandCards[1]],
    );
    const cardNotInWhiteHand = tempCommandCards[0];

    expect(() => chooseCard(cardState, 'white', cardNotInWhiteHand)).toThrow(
      `Card ${tempCommandCards[0].id} not found in White player's hand`,
    );
  });
});
