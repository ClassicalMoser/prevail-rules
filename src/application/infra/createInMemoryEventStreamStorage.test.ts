import type { GameEffectEvent } from '@events';
import { createInMemoryEventStreamStorage } from './createInMemoryEventStreamStorage';

const gameId = 'game-1';

/** Two events with nothing in common, so their order shows. */
const putAside: GameEffectEvent = {
  effectType: 'discardPlayedCards',
  eventType: 'gameEffect',
};
const roundEnd: GameEffectEvent = {
  effectType: 'roundEnd',
  eventType: 'gameEffect',
};

/**
 * Each round of each game has its own stream of events, opened before its
 * first event and flushed once the round is over.
 */
describe('createInMemoryEventStreamStorage function', () => {
  it('opens an empty stream, then keeps events in the order they were added', async () => {
    const storage = createInMemoryEventStreamStorage();

    // A round's stream starts empty.
    await expect(storage.newEventStream(gameId, 1)).resolves.toStrictEqual({
      data: [],
      result: true,
    });

    // Each event goes on the end, and the answer is the stream so far.
    await storage.addEventToStream(gameId, 1, putAside);
    await expect(
      storage.addEventToStream(gameId, 1, roundEnd),
    ).resolves.toStrictEqual({
      data: [putAside, roundEnd],
      result: true,
    });

    // Reading the stream gives the same events, in order.
    await expect(storage.getEventStream(gameId, 1)).resolves.toStrictEqual({
      data: [putAside, roundEnd],
      result: true,
    });
  });

  it('refuses an event for a round whose stream was never opened', async () => {
    const storage = createInMemoryEventStreamStorage();

    // Nothing opens a stream implicitly.
    await expect(
      storage.addEventToStream(gameId, 2, putAside),
    ).resolves.toStrictEqual({
      errorReason: 'No event stream for game game-1, round 2',
      result: false,
    });
  });

  it('answers no stream for a round that has none', async () => {
    const storage = createInMemoryEventStreamStorage();

    // An unopened round reads as no stream at all, not an empty one.
    await expect(storage.getEventStream(gameId, 3)).resolves.toStrictEqual({
      data: undefined,
      result: true,
    });
  });

  it('drops a flushed stream, since in memory there is nowhere further to keep it', async () => {
    const storage = createInMemoryEventStreamStorage();
    await storage.newEventStream(gameId, 0);
    await storage.addEventToStream(gameId, 0, putAside);

    // Flushing succeeds once, and afterwards the round has no stream.
    await expect(storage.flushEventStream(gameId, 0)).resolves.toStrictEqual({
      data: undefined,
      result: true,
    });
    await expect(storage.getEventStream(gameId, 0)).resolves.toStrictEqual({
      data: undefined,
      result: true,
    });

    // A second flush finds nothing to flush.
    await expect(storage.flushEventStream(gameId, 0)).resolves.toStrictEqual({
      errorReason: 'No event stream for game game-1, round 0',
      result: false,
    });
  });

  it('cuts a stream back to the events before a given one', async () => {
    const storage = createInMemoryEventStreamStorage();
    await storage.newEventStream(gameId, 1);
    await storage.addEventToStream(gameId, 1, putAside);
    await storage.addEventToStream(gameId, 1, roundEnd);

    // Removing from the second event on leaves only the first.
    await expect(
      storage.truncateEventStream(gameId, 1, 1),
    ).resolves.toStrictEqual({
      data: [putAside],
      result: true,
    });

    // A round with no stream cannot be cut back.
    await expect(
      storage.truncateEventStream(gameId, 9, 0),
    ).resolves.toStrictEqual({
      errorReason: 'No event stream for game game-1, round 9',
      result: false,
    });
  });
});
