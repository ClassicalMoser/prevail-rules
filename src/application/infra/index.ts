// The random source for live play.
export { mathRandom } from './mathRandom';

// Games kept in memory, each with its stream of events.
export { createInMemoryGameStorage } from './createInMemoryGameStorage';

// All of the above, assembled into the ports the application runs on.
export { createInMemoryEnginePorts } from './createInMemoryEnginePorts';
