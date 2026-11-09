// One step forward along a facing. Undefined when that step leaves the board.
export { getForwardSpace } from './getForwardSpace';

// The same step repeated to the edge. The origin is not included.
export { getForwardSpacesToEdge } from './getForwardSpacesToEdge';

// One step back: forward along the opposite facing.
export { getRearwardSpace } from './getRearwardSpace';

// The facing a step from one space into its neighbour was taken on.
export { getStepFacing } from './getStepFacing';
