import { standardBoardColumnNumbers, standardBoardColumnNumbersSchema, } from "../entities/board/standardBoard/standardColumnNumbers.js";
import { standardBoardRowLetters, standardBoardRowLettersSchema, } from "../entities/board/standardBoard/standardRowLetters.js";
import { unitFacingSchema } from "../entities/unit/unitFacing.js";
/**
 * Calculates the row delta (vertical movement) for a given facing direction.
 *
 * The board uses a coordinate system where:
 * - Rows are letters (A-L), with A being the top row
 * - Moving "north" decreases the row index (A=0, B=1, ..., L=11)
 * - Moving "south" increases the row index
 * - Orthogonal east and west facings have no row delta
 *
 * @param facing - The direction the unit is facing
 * @returns The row delta: -1 for north, +1 for south, 0 for east/west
 */
const getRowDelta = (facing) => {
    switch (facing) {
        case "northWest":
            return -1;
        case "north":
            return -1;
        case "northEast":
            return -1;
        case "southWest":
            return 1;
        case "south":
            return 1;
        case "southEast":
            return 1;
        default:
            return 0;
    }
};
/**
 * Calculates the column delta (horizontal movement) for a given facing direction.
 *
 * The board uses a coordinate system where:
 * - Columns are numbers (1-18), with 1 being the leftmost column
 * - Moving "east" increases the column index
 * - Moving "west" decreases the column index
 * - Orthogonal facings (north/south) have no column delta
 *
 * @param facing - The direction the unit is facing
 * @returns The column delta: +1 for east, -1 for west, 0 for north/south
 */
const getColumnDelta = (facing) => {
    switch (facing) {
        case "northEast":
            return 1;
        case "east":
            return 1;
        case "southEast":
            return 1;
        case "northWest":
            return -1;
        case "west":
            return -1;
        case "southWest":
            return -1;
        default:
            return 0;
    }
};
/**
 * Calculates the coordinate of the space directly forward from a given coordinate
 * in the specified facing direction.
 *
 * This is a fundamental building block for movement and area calculation functions.
 * It handles:
 * - Input validation (coordinate format, facing validity)
 * - Coordinate system translation (string coordinates to indices)
 * - Movement calculation (applying deltas based on facing)
 * - Boundary checking (returns undefined for out-of-bounds spaces)
 *
 * @param coordinate - The starting coordinate (e.g., "E5")
 * @param facing - The direction the unit is facing (e.g., "north", "southEast")
 * @returns The forward space coordinate, or undefined if the space is out of bounds
 * @throws {Error} If the coordinate format is invalid (invalid row or column)
 * @throws {Error} If the facing direction is invalid
 *
 * @example
 * getForwardSpace("E5", "north") // Returns "D5"
 * getForwardSpace("A1", "north") // Returns undefined (out of bounds)
 * getForwardSpace("E5", "southEast") // Returns "F6"
 */
export const getForwardSpace = (coordinate, facing) => {
    // Parse and validate the row component (first character of coordinate)
    // Coordinates are formatted as "RowColumn" (e.g., "E5" = row E, column 5)
    const inputRow = coordinate.slice(0, 1);
    const inputRowResult = standardBoardRowLettersSchema.safeParse(inputRow);
    if (!inputRowResult.success) {
        throw new Error(`Invalid row: ${inputRow}`);
    }
    // Parse and validate the column component (remaining characters of coordinate)
    const inputColumn = coordinate.slice(1);
    const inputColumnResult = standardBoardColumnNumbersSchema.safeParse(inputColumn);
    if (!inputColumnResult.success) {
        throw new Error(`Invalid column: ${inputColumn}`);
    }
    // Validate the facing direction to ensure it's a valid UnitFacing
    const facingResult = unitFacingSchema.safeParse(facing);
    if (!facingResult.success) {
        throw new Error(`Invalid facing: ${facing}`);
    }
    // Convert string coordinates to array indices for mathematical operations
    // This allows us to add/subtract deltas to calculate the new position
    const currentRowIndex = standardBoardRowLetters.indexOf(inputRow);
    const currentColumnIndex = standardBoardColumnNumbers.indexOf(inputColumn);
    // Calculate the new position by applying the movement deltas
    // The deltas are determined by the facing direction (north = -1 row, east = +1 column, etc.)
    const newRowIndex = currentRowIndex + getRowDelta(facing);
    const newColumnIndex = currentColumnIndex + getColumnDelta(facing);
    // Boundary check: if the calculated indices are outside the board bounds,
    // return undefined instead of throwing an error. This allows callers to handle
    // out-of-bounds cases gracefully (e.g., filtering invalid spaces from sets)
    if (newRowIndex < 0 ||
        newRowIndex >= standardBoardRowLetters.length ||
        newColumnIndex < 0 ||
        newColumnIndex >= standardBoardColumnNumbers.length) {
        return undefined;
    }
    // Convert the calculated indices back to string coordinates
    const newRow = standardBoardRowLetters[newRowIndex];
    const newColumn = standardBoardColumnNumbers[newColumnIndex];
    // Reconstruct the coordinate string in the standard format
    return `${newRow}${newColumn}`;
};
