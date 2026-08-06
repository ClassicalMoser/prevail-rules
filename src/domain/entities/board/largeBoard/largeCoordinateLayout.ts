import type { Coordinate } from '../boardCoordinates';
import type { CoordinateLayout } from '../coordinateLayout';

import { largeBoardColumnNumbers } from './largeColumnNumbers';
import { largeBoardRowLetters } from './largeRowLetters';

const rowIndexMap = new Map<string, number>(
  largeBoardRowLetters.map((s, i) => [s, i]),
);
const columnIndexMap = new Map<string, number>(
  largeBoardColumnNumbers.map((s, i) => [s, i]),
);

export const largeCoordinateLayout: CoordinateLayout = {
  columnNumbers: largeBoardColumnNumbers,
  createCoordinate: (row, column) => `${row}-${column}` as Coordinate,
  getColumnIndex: (col) => columnIndexMap.get(col) ?? -1,
  getRowIndex: (row) => rowIndexMap.get(row) ?? -1,
  rowLetters: largeBoardRowLetters,
};
