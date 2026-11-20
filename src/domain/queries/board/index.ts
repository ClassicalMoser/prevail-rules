// Neighbors: orthogonal, diagonal, all eight; then front, flank, and rear arcs,
// and which of those a given neighbour lies on.
export {
  getOrthogonallyAdjacentSpaces,
  getDiagonallyAdjacentSpaces,
  getAdjacentSpaces,
  getFrontSpaces,
  getFlankingSpaces,
  getBackSpaces,
  findNeighbourSide,
} from './adjacency';

// Regions: inline, half-plane, ahead, behind, arc, within distance.
export {
  getInlineSpaces,
  getHalfPlaneInDirection,
  getSpacesAhead,
  getSpacesBehind,
  getSpacesInArc,
  getSpacesWithinDistance,
} from './areas';

// One step forward, forward to the edge, one step rearward, and the facing a
// step between two neighbours was taken on.
export {
  findForwardSpace,
  getForwardSpacesToEdge,
  findRearwardSpace,
  findStepFacing,
} from './steps';

// Every coordinate on the board.
export { getBoardCoordinates } from './getBoardCoordinates';

// Coordinates whose space holds an engagement.
export { getBoardCoordinatesWithEngagedUnits } from './getBoardCoordinatesWithEngagedUnits';

// Where a space sits in rows and columns, or none off this board.
export { findGridPosition } from './findGridPosition';

// Where a space sits in rows and columns.
export { getGridPosition } from './getGridPosition';

// The space at a row and column, or none past an edge.
export { findCoordinateAtPosition } from './findCoordinateAtPosition';

// The two spaces a diagonal step cuts between.
export { getDiagonalCornerSpaces } from './getDiagonalCornerSpaces';

// A set of spaces written down in board order, an order that means nothing.
export { listInBoardOrder } from './listInBoardOrder';

// How many spaces apart two spaces are, a diagonal step counting as one.
export { getSpacesApart } from './getSpacesApart';

// The space at a coordinate.
export { getBoardSpace } from './getBoardSpace';

// The single unit standing on a coordinate, with its placement.
export { getSingleUnitWithPlacementAtCoordinate } from './getSingleUnitWithPlacementAtCoordinate';

// Space occupied by a side's commander.
export { findCommanderSpace } from './findCommanderSpace';
// The same, insisting the commander is on the board.
export { getCommanderSpace } from './getCommanderSpace';

// Whether the diagonal between two spaces is free of enemy units.
export { diagonalIsClear } from './diagonalIsClear';
