import type { CoordinateLayout } from '../coordinateLayout';

import type { LargeBoardColumnNumber } from './largeColumnNumbers';
import { largeBoardColumnNumbers } from './largeColumnNumbers';
import type { LargeBoardRowLetter } from './largeRowLetters';
import { largeBoardRowLetters } from './largeRowLetters';

const rowIndexMap = new Map<string, number>(
  largeBoardRowLetters.map((s, i) => [s, i]),
);
const columnIndexMap = new Map<string, number>(
  largeBoardColumnNumbers.map((s, i) => [s, i]),
);

export const largeCoordinateLayout: CoordinateLayout<
  LargeBoardRowLetter,
  LargeBoardColumnNumber
> = {
  columnNumbers: largeBoardColumnNumbers,
  createCoordinate: (row, column) => `${row}-${column}`,
  getColumnIndex: (col) => columnIndexMap.get(col) ?? -1,
  getRowIndex: (row) => rowIndexMap.get(row) ?? -1,
  rowLetters: largeBoardRowLetters,
};
