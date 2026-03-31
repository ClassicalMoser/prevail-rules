import type { StandardBoard } from '@entities';
import type { Event } from '@events';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { getCurrentEventStream } from './getCurrentEventStream';

describe('getCurrentEventStream', () => {
  it('returns the current round events array (same reference)', () => {
    const state = createEmptyGameState();
    const stream = getCurrentEventStream(state);

    expect(stream).toBe(state.currentRoundState.events);
    expect(stream).toEqual([]);
  });

  it('reflects events attached to the round state', () => {
    const state = createEmptyGameState();
    const events: readonly Event<StandardBoard>[] = [
      {
        eventNumber: 0,
        eventType: 'gameEffect',
        effectType: 'revealCards',
      },
    ];
    state.currentRoundState = {
      ...state.currentRoundState,
      events,
    };

    expect(getCurrentEventStream(state)).toEqual(events);
  });
});
