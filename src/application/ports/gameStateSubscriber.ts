import type { GameModeName } from '@entities';
import type { GameStateChange } from './gameStateChange';

/**
 * Receives updates for one game instance (`gameId` + `gameMode` must match the change).
 */
export interface GameStateSubscriber {
  gameId: string;
  gameMode: GameModeName;
  onGameStateChange: (change: GameStateChange) => void;
  onError: (error: Error) => void;
}
