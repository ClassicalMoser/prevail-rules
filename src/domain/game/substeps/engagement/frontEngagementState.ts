import type { ENGAGEMENT_RESOLUTION_SUBSTEP_TYPE } from '../substepType';
import type { FrontEngagementResolutionState } from './frontEngagementResolutionSubstep';

/**
 * An engagement known to be from the front, whose defender falls back, or stands and fights (§6.3.2).
 * It is an `EngagementState` whose resolution is the front one; a query
 * that has checked the engagement's type answers this, so its caller reads
 * the front engagement's fields without checking again.
 */
export interface FrontEngagementState {
  /** The type of the substep. */
  substepType: typeof ENGAGEMENT_RESOLUTION_SUBSTEP_TYPE;
  /** The resolution of an engagement from the front. */
  engagementResolutionState: FrontEngagementResolutionState;
  /** Whether the engagement is complete. */
  completed: boolean;
}
