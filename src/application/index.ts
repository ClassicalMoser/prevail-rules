/** Application layer: use cases, process pipeline, and port types. Narrow storage payloads in composables before `process/*`. */
export { createGameRunner } from "./gameRunner";
export type {
  EnginePorts,
  EventStreamStorage,
  GameRunner,
  GameStateChange,
  GameStateSubscriber,
  GameStorage,
  PortResponse,
  RoundSnapshotStorage,
} from "./ports";
