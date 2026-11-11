import { updateCurrentInitiative } from '@transforms/pureTransforms';
import type { GameOverEvent } from '@events';

import { applyGameOverEvent } from './applyGameOverEvent';

import { createEmptyGameState } from '@factories';

describe('applyGameOverEvent function', () => {
  it('assigns the winner from the event', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const event: GameOverEvent = {
      effectType: 'gameOver',
      eventType: 'gameEffect',
      winner: 'white',
    };

    const newState = applyGameOverEvent(event, state);

    expect(newState.winner).toBe('white');
    expect(newState).not.toBe(state);
    expect(state.winner).toBeUndefined();
  });

  it('does not change phase or initiative', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const event: GameOverEvent = {
      effectType: 'gameOver',
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
