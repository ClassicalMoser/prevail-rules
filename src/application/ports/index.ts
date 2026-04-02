export type { EnginePorts } from './enginePorts';
/**
 * **Outbound ports** (driven by the application, implemented by infrastructure).
 *
 * Types here stay **relatively wide** (`Game`, `GameState<TBoard extends Board>`, …): adapters
 * only see storage and transport shapes. **Correlated** variants (`GameOfType<T>`, `GameStateWithBoard<BoardForGameType<T>>`)
 * are established **after** load (`parseStoredGame`, `getGame`, `getGameState`), then passed into
 * `process/*` where stricter typing pays off.
 */
export type { EventStreamStorage } from './eventStreamStorage';
export type { GameRunner } from './gameRunner';
export type { GameStateChange } from './gameStateChange';
export type { GameStateSubscriber } from './gameStateSubscriber';
export type { GameStorage } from './gameStorage';
export type { PortResponse } from './portResponse';
export type { RoundSnapshotStorage } from './roundSnapshotStorage';
