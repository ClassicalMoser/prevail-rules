import type { UnitFacing } from '@entities';

/**
 * Calculates the row delta (vertical movement) for a given facing direction.
 *
 * TODO(composition): a step's row and column deltas are two switches here and
 * a facing check in `findForwardSpace`, three reads on the hottest path. One
 * constant table of deltas per facing would serve all three; settle where it
 * lives (beside `unitFacings`) and whether an unknown facing still throws.
 *
 * TODO(misleading): the row range says A-L and A=0 ... L=11, but the large
 * board runs to row X; settle by naming the range per size or dropping it.
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
export const getRowDelta = (facing: UnitFacing): number => {
  switch (facing) {
    case 'northWest': {
      // Its northward part: one row toward row A, the north edge.
      return -1;
    }
    case 'north': {
      // Straight north: one row toward row A.
      return -1;
    }
    case 'northEast': {
      // Its northward part: one row toward row A.
      return -1;
    }
    case 'southWest': {
      // Its southward part: one row away from row A, toward the south edge.
      return 1;
    }
    case 'south': {
      // Straight south: one row away from row A.
      return 1;
    }
    case 'southEast': {
      // Its southward part: one row away from row A.
      return 1;
    }
    default: {
      // East and west step along their own row.
      return 0;
    }
  }
};

/**
 * Calculates the column delta (horizontal movement) for a given facing direction.
 *
 * TODO(misleading): the column range says 1-18, but the large board runs to
 * column 36; settle by naming the range per size or dropping it.
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
export const getColumnDelta = (facing: UnitFacing): number => {
  switch (facing) {
    case 'northEast': {
      // Its eastward part: one column away from column 1, the west edge.
      return 1;
    }
    case 'east': {
      // Straight east: one column away from column 1.
      return 1;
    }
    case 'southEast': {
      // Its eastward part: one column away from column 1.
      return 1;
    }
    case 'northWest': {
      // Its westward part: one column toward column 1.
      return -1;
    }
    case 'west': {
      // Straight west: one column toward column 1.
      return -1;
    }
    case 'southWest': {
      // Its westward part: one column toward column 1.
      return -1;
    }
    default: {
      // North and south step along their own column.
      return 0;
    }
  }
};
