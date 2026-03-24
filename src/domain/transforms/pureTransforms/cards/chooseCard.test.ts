import type { CardState } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { chooseCard } from './chooseCard';

/**
 * chooseCard: Moves a card from a player's hand to awaitingPlay (choosing a card for play).
 */
describe('chooseCard', () => {
  function cardStateWithHands(
    blackHand: typeof commandCards,
    whiteHand: typeof commandCards,
  ): CardState {
    const state = createEmptyGameState();
    return {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inHand: [...blackHand],
        awaitingPlay: null,
      },
      white: {
        ...state.cardState.white,
        inHand: [...whiteHand],
        awaitingPlay: null,
      },
    };
  }

  it('moves card from black hand to awaitingPlay', () => {
    const cardState = cardStateWithHands(
      [commandCards[0], commandCards[1]],
      [commandCards[2]],
    );

    const result = chooseCard(cardState, 'black', commandCards[0]);

    expect(result.black.inHand).toEqual([commandCards[1]]);
    expect(result.black.awaitingPlay).toBe(commandCards[0]);
    expect(result.white.inHand).toEqual([commandCards[2]]);
    expect(result.white.awaitingPlay).toBeNull();
  });

  it('moves card from white hand to awaitingPlay', () => {
    const cardState = cardStateWithHands(
      [commandCards[0]],
      [commandCards[1], commandCards[2]],
    );

    const result = chooseCard(cardState, 'white', commandCards[1]);

    expect(result.white.inHand).toEqual([commandCards[2]]);
    expect(result.white.awaitingPlay).toBe(commandCards[1]);
    expect(result.black.inHand).toEqual([commandCards[0]]);
    expect(result.black.awaitingPlay).toBeNull();
  });

  it('throws when card not in black player hand', () => {
    const cardState = cardStateWithHands([commandCards[0]], [commandCards[1]]);
    const cardNotInBlackHand = commandCards[1];

    expect(() => chooseCard(cardState, 'black', cardNotInBlackHand)).toThrow(
      `Card ${commandCards[1].id} not found in Black player's hand`,
    );
  });

  it('throws when card not in white player hand', () => {
    const cardState = cardStateWithHands([commandCards[0]], [commandCards[1]]);
    const cardNotInWhiteHand = commandCards[0];

    expect(() => chooseCard(cardState, 'white', cardNotInWhiteHand)).toThrow(
      `Card ${commandCards[0].id} not found in White player's hand`,
    );
  });
});
