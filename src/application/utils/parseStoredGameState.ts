import type { BoardForGameType, GameState, GameType } from '@entities';
import {
  gameStateSchemaForSmallBoard,
  gameStateSchemaForStandardBoard,
} from '@entities';

/**
 * **Boundary:** validates untrusted / stored data and returns a typed {@link GameState}.
 * Mirrors {@link parseStoredGame} but for round snapshots and other loose game-state payloads.
 */

export function parseStoredGameState(
  gameType: 'standard',
  data: unknown,
): GameState<BoardForGameType['standard']>;
export function parseStoredGameState(
  gameType: 'mini',
  data: unknown,
): GameState<BoardForGameType['mini']>;
export function parseStoredGameState(
  gameType: 'tutorial',
  data: unknown,
): GameState<BoardForGameType['tutorial']>;
export function parseStoredGameState(
  gameType: GameType,
  data: unknown,
): GameState<BoardForGameType[GameType]>;
export function parseStoredGameState(
  gameType: GameType,
  data: unknown,
): GameState<BoardForGameType[GameType]> {
  switch (gameType) {
    case 'standard': {
      const parsed = gameStateSchemaForStandardBoard.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      return parsed.data;
    }
    case 'mini':
    case 'tutorial': {
      const parsed = gameStateSchemaForSmallBoard.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      return parsed.data;
    }
    default: {
      const _exhaustive: never = gameType;
      throw new Error(`Unknown gameType: ${_exhaustive}`);
    }
  }
}
