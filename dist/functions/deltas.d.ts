import type { UnitFacing } from "src/entities/unit/unitFacing.js";
/**
 * Calculates the row delta (vertical movement) for a given facing direction.
 *
 * The board uses a coordinate system where:
 * - Rows are letters (A-L, depending on the board size), with A being the top row
 * - Moving "north" decreases the row index (A=0, B=1, ..., L=11)
 * - Moving "south" increases the row index
 * - Orthogonal east and west facings have no row delta
 *
 * @param facing - The direction the unit is facing
 * @returns The row delta: -1 for north, +1 for south, 0 for east/west
 */
export declare const getRowDelta: (facing: UnitFacing) => number;
/**
 * Calculates the column delta (horizontal movement) for a given facing direction.
 *
 * The board uses a coordinate system where:
 * - Columns are numbers (1-18, depending on the board size), with 1 being the leftmost column
 * - Moving "east" increases the column index
 * - Moving "west" decreases the column index
 * - Orthogonal facings (north/south) have no column delta
 *
 * @param facing - The direction the unit is facing
 * @returns The column delta: +1 for east, -1 for west, 0 for north/south
 */
export declare const getColumnDelta: (facing: UnitFacing) => number;
//# sourceMappingURL=deltas.d.ts.map
