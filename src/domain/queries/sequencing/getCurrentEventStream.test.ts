import type { Event } from '@events';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { getCurrentEventStream } from './getCurrentEventStream';

describe(getCurrentEventStream, () => {
  it('returns the current round events array (same reference)', () => {
    const state = createEmptyGameState();
    const stream = getCurrentEventStream(state);

    expect(stream).toBe(state.currentRoundState.events);
    expect(stream).toStrictEqual([]);
  });

  it('reflects events attached to the round state', () => {
    const state = createEmptyGameState();
    const events: readonly Event[] = [
      {
        black: tempCommandCards[0],
        effectType: 'revealCards',
        eventNumber: 0,
        eventType: 'gameEffect',
        white: tempCommandCards[1],
      },
    ];
    state.currentRoundState = {
      ...state.currentRoundState,
      events,
    };

    expect(getCurrentEventStream(state)).toStrictEqual(events);
  });
});
