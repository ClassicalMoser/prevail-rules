import type { GameType } from '@entities';
import type { GameState } from '@game';

/**
 * Payload after a successful persisted game-state update.
 * {@link gameType} and {@link gameState} are wide at the type level so ports and subscribers
 * stay non-generic; narrow after load (e.g. with {@link parseStoredGameState}) if needed.
 */
export interface GameStateChange {
  gameId: string;
  gameType: GameType;
  gameState: GameState;
}
