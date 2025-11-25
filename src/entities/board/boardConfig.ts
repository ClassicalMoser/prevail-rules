/**
 * Type-safe board configuration system.
 *
 * This module provides compile-time board configurations that eliminate
 * runtime branching and redundant validation. Since boards are validated
 * at boundaries (via Zod schemas), internal functions can trust the types.
 */

import type {
  SmallBoardCoordinate,
  StandardBoardCoordinate,
} from "src/entities/index.js";
import {
  smallBoardColumnNumbers,
  smallBoardRowLetters,
  standardBoardColumnNumbers,
  standardBoardRowLetters,
} from "src/entities/index.js";

/**
 * Board configuration for coordinate calculations.
 * Contains only the data needed for calculations - no runtime validation.
 */
export interface BoardConfig<TCoordinate extends string> {
  readonly rowLetters: readonly string[];
  readonly columnNumbers: readonly string[];
  createCoordinate: (row: string, column: string) => TCoordinate;
}

/**
 * Standard board configuration.
 * Type-safe and compile-time only - no runtime overhead.
 */
export const standardBoardConfig: BoardConfig<StandardBoardCoordinate> = {
  rowLetters: standardBoardRowLetters,
  columnNumbers: standardBoardColumnNumbers,
  createCoordinate: (row, column) =>
    `${row}-${column}` as StandardBoardCoordinate,
} as const;

/**
 * Small board configuration.
 * Type-safe and compile-time only - no runtime overhead.
 */
export const smallBoardConfig: BoardConfig<SmallBoardCoordinate> = {
  rowLetters: smallBoardRowLetters,
  columnNumbers: smallBoardColumnNumbers,
  createCoordinate: (row, column) => `${row}-${column}` as SmallBoardCoordinate,
} as const;

/**
 * Type-safe map from board type to configuration.
 * Used for compile-time lookup - no runtime branching needed.
 */
export const boardConfigMap = {
  standard: standardBoardConfig,
  small: smallBoardConfig,
} as const;
