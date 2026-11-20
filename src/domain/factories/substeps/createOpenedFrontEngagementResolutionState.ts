import type { FrontEngagementResolutionState } from '@game';

/**
 * A front engagement the moment it starts (§6.3.2): the defender has not yet
 * committed a card, and whether it can fall back, and whether it will, are
 * not yet worked out. The engaging unit's Speed is already settled, sampled
 * where its move began.
 *
 * @param engagingSpeed - The engaging unit's Speed, sampled where its move began
 * @returns The front engagement's resolution, at its first stage
 */
export function createOpenedFrontEngagementResolutionState(
  engagingSpeed: number,
): FrontEngagementResolutionState {
  const resolution: FrontEngagementResolutionState = {
    engagingSpeed,
    retreatPaths: 'pending',
    defendingUnitRetreats: 'pending',
    defensiveCommitment: { commitmentType: 'pending' },
    engagementType: 'front',
    retreatState: 'pending',
  };
  return resolution;
}
