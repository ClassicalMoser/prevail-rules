import type { GameType } from "@entities";
import type { GameStateChange } from "./gameStateChange";

/**
 * Receives updates for one game instance (`gameId` + `gameType` must match the change).
 */
export interface GameStateSubscriber {
  gameId: string;
  gameType: GameType;
  onGameStateChange: (change: GameStateChange) => void;
  onError: (error: Error) => void;
}
