import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, updateCardState } from '@testing';

import { generateGameOverEvent } from './generateGameOverEvent';

describe(generateGameOverEvent, () => {
  it('bakes black as winner when white hand is empty', () => {
    const base = createEmptyGameState();
    const state = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });

    expect(generateGameOverEvent(state, 3)).toStrictEqual({
      effectType: 'gameOver',
      eventNumber: 3,
      eventType: 'gameEffect',
      winner: 'black',
    });
  });

  it('bakes null winner for a draw when both hands are empty', () => {
    const base = createEmptyGameState();
    const state = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [] },
      white: { ...base.cardState.white, inHand: [] },
    });

    expect(generateGameOverEvent(state, 0).winner).toBeNull();
  });

  it('throws when the game is not over', () => {
    const state = createEmptyGameState();
    expect(state.cardState.white.inHand).toStrictEqual([tempCommandCards[3]]);
    expect(() => generateGameOverEvent(state, 0)).toThrow(
      'Game over is not expected for the current game state',
    );
  });
});
