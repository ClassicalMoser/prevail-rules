import type { GameOverEvent } from '@events';
import { createEmptyGameState } from '@testing';

import { applyGameOverEvent } from './applyGameOverEvent';

describe(applyGameOverEvent, () => {
  it('assigns the winner from the event', () => {
    const state = createEmptyGameState();
    const event: GameOverEvent = {
      effectType: 'gameOver',
      eventNumber: 0,
      eventType: 'gameEffect',
      winner: 'white',
    };

    const newState = applyGameOverEvent(event, state);

    expect(newState.winner).toBe('white');
    expect(newState).not.toBe(state);
    expect(state.winner).toBeUndefined();
  });

  it('assigns null for a draw', () => {
    const state = createEmptyGameState();
    const event: GameOverEvent = {
      effectType: 'gameOver',
      eventNumber: 1,
      eventType: 'gameEffect',
      winner: null,
    };

    expect(applyGameOverEvent(event, state).winner).toBeNull();
  });

  it('does not change phase or initiative', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const event: GameOverEvent = {
      effectType: 'gameOver',
      eventNumber: 0,
      eventType: 'gameEffect',
      winner: 'black',
    };

    const newState = applyGameOverEvent(event, state);

    expect(newState.currentInitiative).toBe('black');
    expect(newState.currentRoundState.currentPhaseState).toBe(
      state.currentRoundState.currentPhaseState,
    );
  });
});
