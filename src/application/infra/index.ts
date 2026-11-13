// The random source for live play.
export { mathRandom } from './mathRandom';

// Storage kept in memory: games, each round's event stream, round snapshots.
export { createInMemoryGameStorage } from './createInMemoryGameStorage';
export { createInMemoryEventStreamStorage } from './createInMemoryEventStreamStorage';
export { createInMemoryRoundSnapshotStorage } from './createInMemoryRoundSnapshotStorage';

// All of the above, assembled into the ports the application runs on.
export { createInMemoryEnginePorts } from './createInMemoryEnginePorts';
