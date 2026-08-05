export { boardSchema, boardType, boardTypeEnum } from './board';
export type { Board, BoardType } from './board';

export {
  largeBoardSchema,
  smallBoardSchema,
  standardBoardSchema,
} from './aliases';
export type {
  BoardOfType,
  LargeBoard,
  SmallBoard,
  StandardBoard,
} from './aliases';

export { coordinateSchema } from './boardCoordinates';
export type { Coordinate, BoardCoordinate } from './boardCoordinates';

export { boardSpaceSchema } from './boardSpace';
export type { BoardSpace } from './boardSpace';

export { coordinateLayoutMap, getCoordinateLayout } from './coordinateLayout';
export type { CoordinateLayout, CoordinateLayoutMap } from './coordinateLayout';

export {
  largeBoardCoordinates,
  largeBoardCoordinateSchema,
  largeBoardColumnNumbers,
  largeBoardRowLetters,
  largeCoordinateLayout,
} from './largeBoard';
export type {
  LargeBoardCoordinate,
  LargeBoardColumnNumber,
  LargeBoardRowLetter,
} from './largeBoard';

export {
  smallBoardCoordinates,
  smallBoardCoordinateSchema,
  smallBoardColumnNumbers,
  smallBoardRowLetters,
  smallCoordinateLayout,
} from './smallBoard';
export type {
  SmallBoardCoordinate,
  SmallBoardColumnNumber,
  SmallBoardRowLetter,
} from './smallBoard';

export {
  standardBoardCoordinates,
  standardBoardCoordinateSchema,
  standardBoardColumnNumbers,
  standardBoardRowLetters,
  standardCoordinateLayout,
} from './standardBoard';
export type {
  StandardBoardCoordinate,
  StandardBoardColumnNumber,
  StandardBoardRowLetter,
} from './standardBoard';
