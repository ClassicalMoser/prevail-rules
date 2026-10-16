import type { Event } from '@events';
import { createEmptyGameState } from '@factories';
import { updateRoundEventStream } from '@transforms';

import { getNextEventNumber } from './getNextEventNumber';

/**
 * The next event number is the length of the round's event stream.
 * The query does not read `eventNumber` on the events already stored.
 */
describe('getNextEventNumber function', () => {
  it('returns 0 for an empty stream', () => {
    // An empty round has not recorded an event, so the first index is 0.
    const state = updateRoundEventStream(createEmptyGameState('standard'), []);

    expect(getNextEventNumber(state)).toBe(0);
  });

  it('returns 2 when the stream has two events', () => {
    // Any event shape works. The query counts entries and ignores their fields.
    const event: Event = {
      effectType: 'completeMovementCommand',
      eventNumber: 0,
      eventType: 'gameEffect',
    };
    // Two entries, numbered 0 and 1. The next index is the count, 2.
    const state = updateRoundEventStream(createEmptyGameState('standard'), [
      event,
      { ...event, eventNumber: 1 },
    ]);

    expect(getNextEventNumber(state)).toBe(2);
  });
});
