/**
 * Type-safe board configuration system.
 * Provides compile-time configurations for coordinate calculations.
 * Boards are validated at boundaries (via Zod schemas), so internal functions trust types.
 */

import type {
  Board,
  BoardCoordinate,
  LargeBoardCoordinate,
  SmallBoardCoordinate,
  StandardBoardCoordinate,
} from "@entities";
import { largeBoardColumnNumbers } from "./largeBoard/largeColumnNumbers";
import { largeBoardRowLetters } from "./largeBoard/largeRowLetters";
import { smallBoardColumnNumbers } from "./smallBoard/smallColumnNumbers";
import { smallBoardRowLetters } from "./smallBoard/smallRowLetters";
import { standardBoardColumnNumbers } from "./standardBoard/standardColumnNumbers";
import { standardBoardRowLetters } from "./standardBoard/standardRowLetters";

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

/**
 * Gets the board config for a given board type with proper type narrowing.
 * This eliminates the need for type assertions when working with generic board types.
 */
export function getBoardConfig<TBoard extends Board>(
  board: TBoard,
): BoardConfig<BoardCoordinate<TBoard>> {
  return boardConfigMap[board.boardType] as BoardConfig<
    BoardCoordinate<TBoard>
  >;
}
