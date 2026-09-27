// Front, flank, or rear relative to the defender's facing.
export { isEngagementFromFlank } from './isEngagementFromFlank';
export { isEngagementFromFront } from './isEngagementFromFront';
export { isEngagementFromRear } from './isEngagementFromRear';

// Engagement slice nested under a movement resolution.
export {
  getEngagementStateFromMovement,
  getFlankEngagementStateFromMovement,
  getFrontEngagementStateFromMovement,
  getRearEngagementStateFromMovement,
} from './engagement';
