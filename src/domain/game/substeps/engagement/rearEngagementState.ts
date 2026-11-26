import type { ENGAGEMENT_RESOLUTION_SUBSTEP_TYPE } from '../substepType';
import type { RearEngagementResolutionState } from './rearEngagementResolutionSubstep';

/**
 * An engagement known to be from the rear, whose defender routs (§6.3.3).
 * It is an `EngagementState` whose resolution is the rear one; a query
 * that has checked the engagement's type answers this, so its caller reads
 * the rear engagement's fields without checking again.
 */
export interface RearEngagementState {
  /** The type of the substep. */
  substepType: typeof ENGAGEMENT_RESOLUTION_SUBSTEP_TYPE;
  /** The resolution of an engagement from the rear. */
  engagementResolutionState: RearEngagementResolutionState;
  /** Whether the engagement is complete. */
  completed: boolean;
}
