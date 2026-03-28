/** Application layer: use cases, process pipeline, and port types. Narrow storage payloads in composables before `process/*`. */
export { createGameRunner } from './gameRunner';
export type {
  EventStreamStorage,
  GameRunner,
  GameStateSubscriber,
  GameStorage,
  PortResponse,
  RoundSnapshotStorage,
} from './ports';
