// Neighbors: orthogonal, diagonal, all eight; then front, flank, and rear arcs.
export {
  getOrthogonallyAdjacentSpaces,
  getDiagonallyAdjacentSpaces,
  getAdjacentSpaces,
  getFrontSpaces,
  getFlankingSpaces,
  getBackSpaces,
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

// One step forward, rearward, left, or right.
export {
  getForwardSpace,
  getForwardSpacesToEdge,
  getLeftSpace,
  getRearwardSpace,
  getRightSpace,
} from './steps';

// Every coordinate on the board.
export { getBoardCoordinates } from './getBoardCoordinates';

// Coordinates whose space holds an engagement.
export { getBoardCoordinatesWithEngagedUnits } from './getBoardCoordinatesWithEngagedUnits';

// The space at a coordinate.
export { getBoardSpace } from './getBoardSpace';

// The single unit standing on a coordinate, with its placement.
export { getSingleUnitWithPlacementAtCoordinate } from './getSingleUnitWithPlacementAtCoordinate';

// Space occupied by a side's commander.
export { getCommanderSpace } from './getCommanderSpace';

// Whether the diagonal between two spaces is free of enemy units.
export { diagonalIsClear } from './diagonalIsClear';
