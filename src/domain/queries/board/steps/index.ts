// One step forward along a facing. Undefined when that step leaves the board.
export { findForwardSpace } from './findForwardSpace';

// The same step repeated to the edge. The origin is not included.
export { getForwardSpacesToEdge } from './getForwardSpacesToEdge';

// One step back: forward along the opposite facing.
export { findRearwardSpace } from './findRearwardSpace';

// The facing a step from one space into its neighbour was taken on.
export { findStepFacing } from './findStepFacing';
