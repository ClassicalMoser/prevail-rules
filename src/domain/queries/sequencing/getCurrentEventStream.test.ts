import type { Event } from '@events';
import { createEmptyGameState } from '@factories';
import { updateRoundEventStream } from '@transforms';

import { getCurrentEventStream } from './getCurrentEventStream';

/**
 * The ordered event log on the current round.
 */
describe('getCurrentEventStream function', () => {
  it('returns the event stream on the round', () => {
    // Any event shape works. The query returns the array it was given.
    const events: readonly Event[] = [
      {
        effectType: 'completeMovementCommand',
        eventNumber: 0,
        eventType: 'gameEffect',
      },
    ];
    const state = updateRoundEventStream(
      createEmptyGameState('standard'),
      events,
    );

    expect(getCurrentEventStream(state)).toBe(events);
  });
});
