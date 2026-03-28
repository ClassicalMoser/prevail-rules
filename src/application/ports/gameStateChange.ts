import type { BoardForGameType, GameState, GameType } from '@entities';

/**
 * Payload after a successful persisted game-state update.
 * Both fields are intentionally wide: {@link gameType} and {@link gameState} are uncorrelated at the
 * type level so ports and subscribers don't need to be generic. Narrow after load if needed.
 */
export interface GameStateChange {
  gameId: string;
  gameType: GameType;
  gameState: GameState<BoardForGameType[GameType]>;
}
