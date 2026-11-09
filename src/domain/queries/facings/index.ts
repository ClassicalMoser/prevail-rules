// 180 degrees around the compass.
export { getOppositeFacing } from './getOppositeFacing';

// 90 degrees counterclockwise, then clockwise.
export { getLeftFacing } from './getLeftFacing';
export { getRightFacing } from './getRightFacing';

// One step to either side, then the two perpendicular facings.
export { getAdjacentFacings } from './getAdjacentFacings';
export { getOrthogonalFacings } from './getOrthogonalFacings';

// The three facings one Flexibility spend reaches: 45° either way, or about.
export { getFacingsOneTurnAway } from './getFacingsOneTurnAway';

// Where one named turn — left, right or about — leaves the facing.
export { getTurnedFacing } from './getTurnedFacing';

// Whether the facing is one of the four diagonals.
export { isDiagonalFacing } from './isDiagonalFacing';
