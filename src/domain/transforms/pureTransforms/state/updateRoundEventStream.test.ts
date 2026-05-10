import type { StandardBoard } from '@entities';
import type { EventForBoard } from '@events';
import { createEmptyGameState } from '@testing';

import { updateRoundEventStream } from './updateRoundEventStream';

describe(updateRoundEventStream, () => {
  it('sets currentRoundState.events to the given stream', () => {
    const state = createEmptyGameState();
    const events: readonly EventForBoard<StandardBoard>[] = [
      {
        effectType: 'revealCards',
        eventNumber: 0,
        eventType: 'gameEffect',
      },
    ];

    const next = updateRoundEventStream(state, events);

    expect(next.currentRoundState.events).toBe(events);
    expect(state.currentRoundState.events).toStrictEqual([]);
  });

  it('does not mutate the original state', () => {
    const state = createEmptyGameState();
    updateRoundEventStream(state, []);

    expect(state.currentRoundState.events).toStrictEqual([]);
  });
});
