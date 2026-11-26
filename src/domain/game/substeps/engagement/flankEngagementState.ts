import type { ENGAGEMENT_RESOLUTION_SUBSTEP_TYPE } from '../substepType';
import type { FlankEngagementResolutionState } from './flankEngagementResolutionSubstep';

/**
 * An engagement known to be from the flank, whose defender is turned to face its attacker (§6.3.4).
 * It is an `EngagementState` whose resolution is the flank one; a query
 * that has checked the engagement's type answers this, so its caller reads
 * the flank engagement's fields without checking again.
 */
export interface FlankEngagementState {
  /** The type of the substep. */
  substepType: typeof ENGAGEMENT_RESOLUTION_SUBSTEP_TYPE;
  /** The resolution of an engagement from the flank. */
  engagementResolutionState: FlankEngagementResolutionState;
  /** Whether the engagement is complete. */
  completed: boolean;
}
