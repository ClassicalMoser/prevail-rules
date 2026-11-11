import { createTestCard, updateCardState } from '@testing';
import { updateCurrentInitiative } from '@transforms';

import { generateGameOverEvent } from './generateGameOverEvent';

import { createEmptyGameState } from '@factories';

describe('generateGameOverEvent function', () => {
  it('bakes black as winner when white hand is empty', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inHand: [createTestCard()],
      },
      white: { ...base.cardState.white, inHand: [] },
    });

    expect(generateGameOverEvent(state)).toStrictEqual({
      effectType: 'gameOver',
      eventType: 'gameEffect',
      winner: 'black',
    });
  });

  it('bakes the holder of initiative as winner when both hands are empty', () => {
    // Both hands emptying at once goes to the initiative held going into
    // the round (§11.3); the event bakes that winner in for replay.
    const base = createEmptyGameState('standard');
    const emptyHands = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [] },
      white: { ...base.cardState.white, inHand: [] },
    });
    // White held initiative going into this round.
    const state = updateCurrentInitiative(emptyHands, 'white');

    expect(generateGameOverEvent(state).winner).toBe('white');
  });

  it('throws when the game is not over', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inHand: [createTestCard()],
      },
      white: {
        ...base.cardState.white,
        inHand: [createTestCard()],
      },
    });
    expect(() => generateGameOverEvent(state)).toThrow(
      'Game over is not expected for the current game state',
    );
  });
});
