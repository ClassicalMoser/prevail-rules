/**
 * Type-safe board configuration system.
 *
 * This module provides compile-time board configurations that eliminate
 * runtime branching and redundant validation. Since boards are validated
 * at boundaries (via Zod schemas), internal functions can trust the types.
 */
import { smallBoardColumnNumbers, smallBoardRowLetters, standardBoardColumnNumbers, standardBoardRowLetters, } from "src/entities/index.js";
/**
 * Standard board configuration.
 * Type-safe and compile-time only - no runtime overhead.
 */
export const standardBoardConfig = {
    rowLetters: standardBoardRowLetters,
    columnNumbers: standardBoardColumnNumbers,
    createCoordinate: (row, column) => `${row}-${column}`,
};
/**
 * Small board configuration.
 * Type-safe and compile-time only - no runtime overhead.
 */
export const smallBoardConfig = {
    rowLetters: smallBoardRowLetters,
    columnNumbers: smallBoardColumnNumbers,
    createCoordinate: (row, column) => `${row}-${column}`,
};
/**
 * Type-safe map from board type to configuration.
 * Used for compile-time lookup - no runtime branching needed.
 */
export const boardConfigMap = {
    standard: standardBoardConfig,
    small: smallBoardConfig,
};
