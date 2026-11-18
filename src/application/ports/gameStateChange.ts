import type { GameModeName } from '@entities';
import type { GameState } from '@game';

/**
 * Payload after a successful persisted game-state update.
 * `gameState` is wide at the type level so ports and subscribers stay non-generic;
 * narrow after load (e.g. with `parseStoredGameState`) if needed.
 */
export interface GameStateChange {
  gameId: string;
  gameMode: GameModeName;
  gameState: GameState;
}
