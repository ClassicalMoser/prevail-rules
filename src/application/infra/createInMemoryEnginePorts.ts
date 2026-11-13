import type { RandomSource } from '@utils';
import type { EnginePorts, GameStateSubscriber } from '@application/ports';
import { createInMemoryEventStreamStorage } from './createInMemoryEventStreamStorage';
import { createInMemoryGameStorage } from './createInMemoryGameStorage';
import { createInMemoryRoundSnapshotStorage } from './createInMemoryRoundSnapshotStorage';
import { mathRandom } from './mathRandom';

/**
 * Every port the application needs, kept in memory: empty storage for games,
 * event streams and round snapshots, the given subscribers, and a random
 * source.
 *
 * @param options - The subscribers to tell of each change (none if omitted),
 * and the random source (`mathRandom` if omitted)
 * @returns A fresh set of engine ports
 */
export function createInMemoryEnginePorts(
  options: {
    gameStateSubscribers?: GameStateSubscriber[];
    random?: RandomSource;
  } = {},
): EnginePorts {
  const ports: EnginePorts = {
    eventStreamStorage: createInMemoryEventStreamStorage(),
    gameStateSubscribers: options.gameStateSubscribers ?? [],
    gameStorage: createInMemoryGameStorage(),
    random: options.random ?? mathRandom,
    roundSnapshotStorage: createInMemoryRoundSnapshotStorage(),
  };

  // Each call starts from empty storage.
  return ports;
}
