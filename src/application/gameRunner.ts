import type { EventStreamStorage, RoundSnapshotStorage } from './ports';

export interface GameRunner {
  runGame: (gameId: string) => void;
}

export function createGameRunner(_ports: {
  roundSnapshotStorage: RoundSnapshotStorage;
  eventStreamStorage: EventStreamStorage;
}): void {}
