import { createTestCard, updateCardState } from '@testing';

import { generateGameOverEvent } from './generateGameOverEvent';

import { createEmptyGameState } from '@factories';
describe(generateGameOverEvent, () => {
  it('bakes black as winner when white hand is empty', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inHand: [createTestCard({ id: 'black-hand' })],
      },
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
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [] },
      white: { ...base.cardState.white, inHand: [] },
    });

    expect(generateGameOverEvent(state, 0).winner).toBeNull();
  });

  it('throws when the game is not over', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inHand: [createTestCard({ id: 'black-hand' })],
      },
      white: {
        ...base.cardState.white,
        inHand: [createTestCard({ id: 'white-hand' })],
      },
    });
    expect(() => generateGameOverEvent(state, 0)).toThrow(
      'Game over is not expected for the current game state',
    );
  });
});
