import type { FrontEngagementResolutionState } from '@game';

/**
 * A front engagement the moment it starts (§6.3.2): the defender has not yet
 * committed a card, and whether it can fall back, and whether it will, are
 * not yet worked out.
 *
 * @returns The front engagement's resolution, at its first stage
 */
export function createOpenedFrontEngagementResolutionState(): FrontEngagementResolutionState {
  const resolution: FrontEngagementResolutionState = {
    retreatPaths: 'pending',
    defendingUnitRetreats: 'pending',
    defensiveCommitment: { commitmentType: 'pending' },
    engagementType: 'front',
    retreatState: 'pending',
  };
  return resolution;
}
