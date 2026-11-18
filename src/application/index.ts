/** Application layer: use cases, process pipeline, and port types. Narrow storage payloads in composables before `process/*`. */
export { createGameRunner } from './gameRunner';
// Default infrastructure: in-memory storage and the live-play random source.
export {
  createInMemoryEnginePorts,
  createInMemoryGameStorage,
  mathRandom,
} from './infra';
export type {
  EnginePorts,
  GameRunner,
  GameStateChange,
  GameStateSubscriber,
  GameStorage,
  NewGame,
  PortResponse,
} from './ports';
