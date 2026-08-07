import type { CoordinateLayout } from '../coordinateLayout';

import type { SmallBoardColumnNumber } from './smallColumnNumbers';
import { smallBoardColumnNumbers } from './smallColumnNumbers';
import type { SmallBoardRowLetter } from './smallRowLetters';
import { smallBoardRowLetters } from './smallRowLetters';

const rowIndexMap = new Map<string, number>(
  smallBoardRowLetters.map((s, i) => [s, i]),
);
const columnIndexMap = new Map<string, number>(
  smallBoardColumnNumbers.map((s, i) => [s, i]),
);

export const smallCoordinateLayout: CoordinateLayout<
  SmallBoardRowLetter,
  SmallBoardColumnNumber
> = {
  columnNumbers: smallBoardColumnNumbers,
  createCoordinate: (row, column) => `${row}-${column}`,
  getColumnIndex: (col) => columnIndexMap.get(col) ?? -1,
  getRowIndex: (row) => rowIndexMap.get(row) ?? -1,
  rowLetters: smallBoardRowLetters,
};
