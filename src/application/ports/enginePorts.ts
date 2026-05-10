import type { EventStreamStorage } from './eventStreamStorage';
import type { GameStateSubscriber } from './gameStateSubscriber';
import type { GameStorage } from './gameStorage';
import type { RoundSnapshotStorage } from './roundSnapshotStorage';

/** All outbound ports required by the application layer. */
export interface EnginePorts {
  gameStorage: GameStorage;
  roundSnapshotStorage: RoundSnapshotStorage;
  eventStreamStorage: EventStreamStorage;
  gameStateSubscribers: GameStateSubscriber[];
}
