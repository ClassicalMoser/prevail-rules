import type { Coordinate } from '../boardCoordinates';
import type { CoordinateLayout } from '../coordinateLayout';

import { smallBoardColumnNumbers } from './smallColumnNumbers';
import { smallBoardRowLetters } from './smallRowLetters';

const rowIndexMap = new Map<string, number>(
  smallBoardRowLetters.map((s, i) => [s, i]),
);
const columnIndexMap = new Map<string, number>(
  smallBoardColumnNumbers.map((s, i) => [s, i]),
);

export const smallCoordinateLayout: CoordinateLayout = {
  columnNumbers: smallBoardColumnNumbers,
  createCoordinate: (row, column) => `${row}-${column}` as Coordinate,
  getColumnIndex: (col) => columnIndexMap.get(col) ?? -1,
  getRowIndex: (row) => rowIndexMap.get(row) ?? -1,
  rowLetters: smallBoardRowLetters,
};
