import type { EngagementResolutionState, EngagementState } from '@game';

/**
 * An engagement the moment a move into an enemy starts it (§6.3): how the two
 * units meet. The engaging unit and the space it moved into are the
 * movement's.
 *
 * @param engagementResolutionState - How the engagement is met, as it opens
 * @returns The engagement, unfinished
 */
export function createOpenedEngagementState(
  engagementResolutionState: EngagementResolutionState,
): EngagementState {
  const engagement: EngagementState = {
    completed: false,
    engagementResolutionState,
    substepType: 'engagementResolution',
  };
  return engagement;
}
