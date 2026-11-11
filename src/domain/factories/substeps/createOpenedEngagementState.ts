import type { UnitInstance, UnitPlacement } from '@entities';
import type { EngagementResolutionState, EngagementState } from '@game';

/**
 * An engagement the moment a move into an enemy starts it (§6.3): the engaging
 * unit, the space it moved into, and how the two meet.
 *
 * @param engagementResolutionState - How the engagement is met, as it opens
 * @param engagingUnit - The unit that moved into the enemy
 * @param targetPlacement - Where the engaging unit moved to
 * @returns The engagement, unfinished
 */
export function createOpenedEngagementState(
  engagementResolutionState: EngagementResolutionState,
  engagingUnit: UnitInstance,
  targetPlacement: UnitPlacement,
): EngagementState {
  const engagement: EngagementState = {
    completed: false,
    engagementResolutionState,
    engagingUnit,
    substepType: 'engagementResolution',
    targetPlacement,
  };
  return engagement;
}
