import type { CoordinateLayout } from '../coordinateLayout';

import type { StandardBoardColumnNumber } from './standardColumnNumbers';
import { standardBoardColumnNumbers } from './standardColumnNumbers';
import type { StandardBoardRowLetter } from './standardRowLetters';
import { standardBoardRowLetters } from './standardRowLetters';

const rowIndexMap = new Map<string, number>(
  standardBoardRowLetters.map((s, i) => [s, i]),
);
const columnIndexMap = new Map<string, number>(
  standardBoardColumnNumbers.map((s, i) => [s, i]),
);

export const standardCoordinateLayout: CoordinateLayout<
  StandardBoardRowLetter,
  StandardBoardColumnNumber
> = {
  columnNumbers: standardBoardColumnNumbers,
  createCoordinate: (row, column) => `${row}-${column}`,
  getColumnIndex: (col) => columnIndexMap.get(col) ?? -1,
  getRowIndex: (row) => rowIndexMap.get(row) ?? -1,
  rowLetters: standardBoardRowLetters,
};
