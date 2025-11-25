/**
 * Type-safe board configuration system.
 * Provides compile-time configurations for coordinate calculations.
 * Boards are validated at boundaries (via Zod schemas), so internal functions trust types.
 */
import { largeBoardColumnNumbers, largeBoardRowLetters, } from "./largeBoard/index.js";
import { smallBoardColumnNumbers, smallBoardRowLetters, } from "./smallBoard/index.js";
import { standardBoardColumnNumbers, standardBoardRowLetters, } from "./standardBoard/index.js";
export const standardBoardConfig = {
    rowLetters: standardBoardRowLetters,
    columnNumbers: standardBoardColumnNumbers,
    createCoordinate: (row, column) => `${row}-${column}`,
};
export const smallBoardConfig = {
    rowLetters: smallBoardRowLetters,
    columnNumbers: smallBoardColumnNumbers,
    createCoordinate: (row, column) => `${row}-${column}`,
};
export const largeBoardConfig = {
    rowLetters: largeBoardRowLetters,
    columnNumbers: largeBoardColumnNumbers,
    createCoordinate: (row, column) => `${row}-${column}`,
};
/**
 * Type-safe map from board type to configuration.
 */
export const boardConfigMap = {
    standard: standardBoardConfig,
    small: smallBoardConfig,
    large: largeBoardConfig,
};
