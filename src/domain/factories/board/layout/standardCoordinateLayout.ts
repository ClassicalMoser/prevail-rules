import type {
  CoordinateLayout,
  StandardBoardColumnNumber,
  StandardBoardRowLetter,
} from '@entities';
import { standardBoardColumnNumbers, standardBoardRowLetters } from '@entities';
import { buildCoordinateLayout } from './buildCoordinateLayout';

/** The standard board: rows A–L, columns 1–18. */
export const standardCoordinateLayout: CoordinateLayout<
  StandardBoardRowLetter,
  StandardBoardColumnNumber
> = buildCoordinateLayout(
  'standard',
  standardBoardRowLetters,
  standardBoardColumnNumbers,
);
