import type { RandomSource } from '@utils';
import type { EnginePorts, GameStateSubscriber } from '@application/ports';
import { createInMemoryGameStorage } from './createInMemoryGameStorage';
import { mathRandom } from './mathRandom';

/**
 * Every port the application needs, kept in memory: empty storage for games,
 * each with its stream of events, the given subscribers, and a random source.
 *
 * @param options - The subscribers to tell of each change (none if omitted),
 * and the random source ({@link mathRandom} if omitted)
 * @returns A fresh set of engine ports
 */
export function createInMemoryEnginePorts(
  options: {
    gameStateSubscribers?: GameStateSubscriber[];
    random?: RandomSource;
  } = {},
): EnginePorts {
  const ports: EnginePorts = {
    gameStateSubscribers: options.gameStateSubscribers ?? [],
    gameStorage: createInMemoryGameStorage(),
    random: options.random ?? mathRandom,
  };

  // Each call starts from empty storage.
  return ports;
}
