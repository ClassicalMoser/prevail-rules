import type {
  CoordinateLayout,
  LargeBoardColumnNumber,
  LargeBoardRowLetter,
} from '@entities';
import { largeBoardColumnNumbers, largeBoardRowLetters } from '@entities';
import { buildCoordinateLayout } from './buildCoordinateLayout';

/** The large board: rows A–X, columns 1–36. */
export const largeCoordinateLayout: CoordinateLayout<
  LargeBoardRowLetter,
  LargeBoardColumnNumber
> = buildCoordinateLayout(
  'large',
  largeBoardRowLetters,
  largeBoardColumnNumbers,
);
