import type { GameMode } from "@entities";
import type { GameStateChange } from "./gameStateChange";

/**
 * Receives updates for one game instance (`gameId` + `gameType` must match the change).
 */
export interface GameStateSubscriber {
  gameId: string;
  gameMode: GameMode;
  onGameStateChange: (change: GameStateChange) => void;
  onError: (error: Error) => void;
}
