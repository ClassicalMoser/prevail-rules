import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { StandardBoardColumnNumber } from "../entities/board/standardBoard/standardColumnNumbers.js";
import type { StandardBoardRowLetter } from "../entities/board/standardBoard/standardRowLetters.js";
import type { UnitFacing } from "../entities/unit/unitFacing.js";
import {
  standardBoardColumnNumbers,
  standardBoardColumnNumbersSchema,
} from "../entities/board/standardBoard/standardColumnNumbers.js";
import {
  standardBoardRowLetters,
  standardBoardRowLettersSchema,
} from "../entities/board/standardBoard/standardRowLetters.js";
import { unitFacingSchema } from "../entities/unit/unitFacing.js";

const getRowDelta = (facing: UnitFacing): number => {
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

const getColumnDelta = (facing: UnitFacing): number => {
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

export const getForwardSpace = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): StandardBoardCoordinate | undefined => {
  const inputRow = coordinate.slice(0, 1) as StandardBoardRowLetter;
  const inputRowResult = standardBoardRowLettersSchema.safeParse(inputRow);
  if (!inputRowResult.success) {
    throw new Error(`Invalid row: ${inputRow}`);
  }
  const inputColumn = coordinate.slice(1) as StandardBoardColumnNumber;
  const inputColumnResult =
    standardBoardColumnNumbersSchema.safeParse(inputColumn);
  if (!inputColumnResult.success) {
    throw new Error(`Invalid column: ${inputColumn}`);
  }
  const facingResult = unitFacingSchema.safeParse(facing);
  if (!facingResult.success) {
    throw new Error(`Invalid facing: ${facing}`);
  }
  const currentRowIndex = standardBoardRowLetters.indexOf(inputRow);
  const currentColumnIndex = standardBoardColumnNumbers.indexOf(inputColumn);

  const newRowIndex = currentRowIndex + getRowDelta(facing);
  const newColumnIndex = currentColumnIndex + getColumnDelta(facing);

  // Check bounds: return undefined if out of bounds
  if (
    newRowIndex < 0 ||
    newRowIndex >= standardBoardRowLetters.length ||
    newColumnIndex < 0 ||
    newColumnIndex >= standardBoardColumnNumbers.length
  ) {
    return undefined;
  }

  const newRow = standardBoardRowLetters[newRowIndex];
  const newColumn = standardBoardColumnNumbers[newColumnIndex];

  return `${newRow}${newColumn}` as StandardBoardCoordinate;
};
