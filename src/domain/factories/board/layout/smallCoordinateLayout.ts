import type {
  CoordinateLayout,
  SmallBoardColumnNumber,
  SmallBoardRowLetter,
} from '@entities';
import { smallBoardColumnNumbers, smallBoardRowLetters } from '@entities';
import { buildCoordinateLayout } from './buildCoordinateLayout';

/** The small board: rows A–H, columns 1–12. */
export const smallCoordinateLayout: CoordinateLayout<
  SmallBoardRowLetter,
  SmallBoardColumnNumber
> = buildCoordinateLayout(
  'small',
  smallBoardRowLetters,
  smallBoardColumnNumbers,
);
