import { smallBoardConfig, standardBoardConfig, } from "../entities/board/boardConfig.js";
/**
 * Creates an empty board space with default values.
 * All spaces start as plain terrain, elevation 0, no water, no units.
 */
function createEmptyBoardSpace() {
    return {
        terrainType: "plain",
        elevation: {
            northWest: 0,
            northEast: 0,
            southWest: 0,
            southEast: 0,
        },
        waterCover: {
            north: false,
            northEast: false,
            east: false,
            southEast: false,
            south: false,
            southWest: false,
            west: false,
            northWest: false,
        },
        unitPresence: {
            presenceType: "none",
        },
    };
}
/**
 * Creates an empty board using the board config pattern.
 * Generates all coordinates and initializes them with empty spaces.
 */
function createEmptyBoardWithConfig(boardType, config) {
    const board = {};
    // Generate all coordinates by combining row letters and column numbers
    for (const row of config.rowLetters) {
        for (const column of config.columnNumbers) {
            const coordinate = config.createCoordinate(row, column);
            board[coordinate] = createEmptyBoardSpace();
        }
    }
    return {
        boardType,
        board: board,
    };
}
/**
 * Creates an empty standard board with all coordinates initialized to default spaces.
 */
export function createEmptyStandardBoard() {
    return createEmptyBoardWithConfig("standard", standardBoardConfig);
}
/**
 * Creates an empty small board with all coordinates initialized to default spaces.
 */
export function createEmptySmallBoard() {
    return createEmptyBoardWithConfig("small", smallBoardConfig);
}
