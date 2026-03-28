import type { Game, GameType } from '@entities';
import {
  miniGameSchema,
  standardGameSchema,
  tutorialGameSchema,
} from '@entities';

/**
 * **Boundary:** validates untrusted / stored data and returns a typed {@link Game}.
 * Call after `GameStorage.getGame` (or equivalent) so downstream code can use `Game<T>` and
 * correlated state instead of pushing those generics through every adapter.
 */

/** Interpret game object as specific {@link GameType} using the Zod schema. */
export function parseStoredGame(
  gameType: 'standard',
  data: unknown,
): Game<'standard'>;
export function parseStoredGame(gameType: 'mini', data: unknown): Game<'mini'>;
export function parseStoredGame(
  gameType: 'tutorial',
  data: unknown,
): Game<'tutorial'>;
/** When `gameType` is only known as {@link GameType}, the result is the wide {@link Game} union. */
export function parseStoredGame(
  gameType: GameType,
  data: unknown,
): Game<GameType>;
export function parseStoredGame(
  gameType: GameType,
  data: unknown,
): Game<GameType> {
  switch (gameType) {
    case 'standard': {
      const parsed = standardGameSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      return parsed.data;
    }
    case 'mini': {
      const parsed = miniGameSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      return parsed.data;
    }
    case 'tutorial': {
      const parsed = tutorialGameSchema.safeParse(data);
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
