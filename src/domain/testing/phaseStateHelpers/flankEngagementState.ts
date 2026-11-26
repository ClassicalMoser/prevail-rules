import type { EngagementState, FlankEngagementResolutionState } from '@game';
import {
  createOpenedEngagementState,
  createOpenedFlankEngagementResolutionState,
} from '@factories';

/**
 * Creates a flank EngagementState with sensible defaults.
 *
 * TODO(composition): the return type is an intersection, which STYLE.md rules
 * out. `queries/engagement/engagement.ts` spells the same flank engagement
 * state the same way, privately. To settle: declare the narrowed shape once in
 * `@game` and name it in both places.
 */
export function createFlankEngagementState(
  overrides?: Partial<FlankEngagementResolutionState>,
): EngagementState & {
  engagementResolutionState: FlankEngagementResolutionState;
} {
  // A defender struck in the flank turns to face its attacker and may not
  // fall back (§6.3.4); as it opens, it has not yet turned.
  const resolution: FlankEngagementResolutionState = {
    ...createOpenedFlankEngagementResolutionState(),
    ...overrides,
  };

  // The engagement holding that resolution.
  const engagement = createOpenedEngagementState(resolution);
  const flank = { ...engagement, engagementResolutionState: resolution };

  // The engagement, for a move's engagement slot.
  return flank;
}
