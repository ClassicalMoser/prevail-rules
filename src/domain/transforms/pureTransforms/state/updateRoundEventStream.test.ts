import type { Event } from '@events';
import { tempCommandCards } from '@sampleValues';

import { updateRoundEventStream } from './updateRoundEventStream';

import { createEmptyGameState } from '@factories';

describe(updateRoundEventStream, () => {
  it('sets currentRoundState.events to the given stream', () => {
    const state = createEmptyGameState('standard');
    const events: readonly Event[] = [
      {
        black: tempCommandCards[0],
        effectType: 'revealCards',
        eventNumber: 0,
        eventType: 'gameEffect',
        white: tempCommandCards[1],
      },
    ];

    const next = updateRoundEventStream(state, events);

    expect(next.currentRoundState.events).toBe(events);
    expect(state.currentRoundState.events).toStrictEqual([]);
  });

  it('does not mutate the original state', () => {
    const state = createEmptyGameState('standard');
    updateRoundEventStream(state, []);

    expect(state.currentRoundState.events).toStrictEqual([]);
  });
});
