import type { GameType } from '@entities';
import type { BoardForGameType, GameStateWithBoard } from '@game';
import {
  gameStateSchemaForSmallBoard,
  gameStateSchemaForStandardBoard,
} from '@game';

/**
 * **Boundary:** validates untrusted / stored data and returns a typed {@link GameState}.
 * Mirrors {@link parseStoredGame} but for round snapshots and other loose game-state payloads.
 */

export function parseStoredGameState(
  gameType: 'standard',
  data: unknown,
): GameStateWithBoard<BoardForGameType['standard']>;
export function parseStoredGameState(
  gameType: 'mini',
  data: unknown,
): GameStateWithBoard<BoardForGameType['mini']>;
export function parseStoredGameState(
  gameType: 'tutorial',
  data: unknown,
): GameStateWithBoard<BoardForGameType['tutorial']>;
export function parseStoredGameState(
  gameType: GameType,
  data: unknown,
): GameStateWithBoard<BoardForGameType[GameType]>;
export function parseStoredGameState(
  gameType: GameType,
  data: unknown,
): GameStateWithBoard<BoardForGameType[GameType]> {
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
