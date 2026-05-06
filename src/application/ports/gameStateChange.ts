import type { GameState } from "@game";

/**
 * Payload after a successful persisted game-state update.
 * {@link gameState} is wide at the type level so ports and subscribers stay non-generic;
 * narrow after load (e.g. with {@link parseStoredGameState}) if needed.
 */
export interface GameStateChange {
  gameId: string;
  gameState: GameState;
}
