import type { Coordinate } from '../boardCoordinates';
import type { CoordinateLayout } from '../coordinateLayout';

import { standardBoardColumnNumbers } from './standardColumnNumbers';
import { standardBoardRowLetters } from './standardRowLetters';

const rowIndexMap = new Map<string, number>(
  standardBoardRowLetters.map((s, i) => [s, i]),
);
const columnIndexMap = new Map<string, number>(
  standardBoardColumnNumbers.map((s, i) => [s, i]),
);

export const standardCoordinateLayout: CoordinateLayout = {
  columnNumbers: standardBoardColumnNumbers,
  createCoordinate: (row, column) => `${row}-${column}` as Coordinate,
  getColumnIndex: (col) => columnIndexMap.get(col) ?? -1,
  getRowIndex: (row) => rowIndexMap.get(row) ?? -1,
  rowLetters: standardBoardRowLetters,
};
