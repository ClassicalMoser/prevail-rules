export type { EnginePorts } from './enginePorts';
/**
 * **Outbound ports** (driven by the application, implemented by infrastructure).
 *
 * Types here stay **relatively wide** (`Game`, `GameState`, …): adapters
 * only see storage and transport shapes. **Correlated** variants (`GameOfType<T>`, `GameState<BoardForGameMode<T>>`)
 * are established **after** load (`parseLegalGameForMode`, `getGame`, `getGameState`), then passed into
 * `process/*` where stricter typing pays off.
 */
export type { GameRunner, NewGame } from './gameRunner';
export type { GameStateChange } from './gameStateChange';
export type { GameStateSubscriber } from './gameStateSubscriber';
export type { GameStorage } from './gameStorage';
export type {
  PortFailureResponse,
  PortResponse,
  PortSuccessResponse,
} from './portResponse';
export type {
  RunnerFailure,
  RunnerFailureResponse,
  RunnerResponse,
} from './runnerResponse';
export { runnerFailures, runnerFailureSchema } from './runnerResponse';
