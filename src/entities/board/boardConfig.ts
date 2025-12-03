/**
 * Type-safe board configuration system.
 * Provides compile-time configurations for coordinate calculations.
 * Boards are validated at boundaries (via Zod schemas), so internal functions trust types.
 */

import type { LargeBoardCoordinate } from "@entities/board/largeBoard/index.js";
import type { SmallBoardCoordinate } from "@entities/board/smallBoard/index.js";
import type { StandardBoardCoordinate } from "@entities/board/standardBoard/index.js";
import {
  largeBoardColumnNumbers,
  largeBoardRowLetters,
} from "@entities/board/largeBoard/index.js";
import {
  smallBoardColumnNumbers,
  smallBoardRowLetters,
} from "@entities/board/smallBoard/index.js";
import {
  standardBoardColumnNumbers,
  standardBoardRowLetters,
} from "@entities/board/standardBoard/index.js";

/**
 * Board configuration for coordinate calculations.
 */
export interface BoardConfig<TCoordinate extends string> {
  readonly rowLetters: readonly string[];
  readonly columnNumbers: readonly string[];
  createCoordinate: (row: string, column: string) => TCoordinate;
}

export const standardBoardConfig: BoardConfig<StandardBoardCoordinate> = {
  rowLetters: standardBoardRowLetters,
  columnNumbers: standardBoardColumnNumbers,
  createCoordinate: (row, column) =>
    `${row}-${column}` as StandardBoardCoordinate,
} as const;

export const smallBoardConfig: BoardConfig<SmallBoardCoordinate> = {
  rowLetters: smallBoardRowLetters,
  columnNumbers: smallBoardColumnNumbers,
  createCoordinate: (row, column) => `${row}-${column}` as SmallBoardCoordinate,
} as const;

export const largeBoardConfig: BoardConfig<LargeBoardCoordinate> = {
  rowLetters: largeBoardRowLetters,
  columnNumbers: largeBoardColumnNumbers,
  createCoordinate: (row, column) => `${row}-${column}` as LargeBoardCoordinate,
} as const;

/**
 * Type-safe map from board type to configuration.
 */
export const boardConfigMap = {
  standard: standardBoardConfig,
  small: smallBoardConfig,
  large: largeBoardConfig,
} as const;
