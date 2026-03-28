import type { BoardForGameType, GameState, GameType } from '@entities';

/**
 * Payload after a successful persisted game-state update.
 * `T` ties {@link GameStateChange.gameType} to {@link GameStateChange.gameState}; use the default
 * `GameType` at boundaries where the variant is unknown. Narrow `T` (e.g. `GameStateChange<'standard'>`)
 * for a fully correlated subscriber.
 */
export interface GameStateChange {
  gameId: string;
  gameType: GameType;
  gameState: GameState<BoardForGameType[GameType]>;
}
