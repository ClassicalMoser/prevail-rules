// Front, flank, or rear relative to the defender's facing.
export { isEngagementFromFront } from './isEngagementFromFront';
export { isEngagementFromFlank } from './isEngagementFromFlank';
export { isEngagementFromRear } from './isEngagementFromRear';

// The engagement on the current movement, then front, flank, and rear.
export {
  getEngagementStateFromMovement,
  getFrontEngagementStateFromMovement,
  getFlankEngagementStateFromMovement,
  getRearEngagementStateFromMovement,
} from './engagement';

// The front engagement, `undefined` where the getter above throws.
export { findFrontEngagementStateFromMovement } from './findFrontEngagementStateFromMovement';

// Where a front engagement stands, the one reading both the sequencer and
// the legal options dispatch on.
export { getFrontEngagementStage } from './getFrontEngagementStage';
export type { FrontEngagementStage } from './getFrontEngagementStage';
