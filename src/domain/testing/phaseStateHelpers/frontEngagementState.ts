import type { UnitInstance } from '@entities';
import type { EngagementState, FrontEngagementResolutionState } from '@game';
import { createUnitWithPlacement } from '@testing/testHelpers';
import {
  createOpenedEngagementState,
  createOpenedFrontEngagementResolutionState,
} from '@factories';

/**
 * The stand-in unit that engages: Black's, as the moving side in these
 * fixtures. Only its Speed is read, as the Speed the defender must beat.
 *
 * @returns A fresh Black stand-in unit
 */
const defaultEngagingUnit = (): UnitInstance =>
  createUnitWithPlacement({ playerSide: 'black' }).unit;

/**
 * Creates a front EngagementState with sensible defaults.
 *
 * TODO(composition): the return type is an intersection, which STYLE.md rules
 * out. `queries/engagement/engagement.ts` spells the same front engagement
 * state the same way, privately. To settle: declare the narrowed shape once in
 * `@game` and name it in both places.
 */
export function createFrontEngagementState(
  overrides?: Partial<FrontEngagementResolutionState>,
): EngagementState & {
  engagementResolutionState: FrontEngagementResolutionState;
} {
  // The engaging unit's Speed, by default its printed Speed: no round
  // effect or committed card counted unless the spec says otherwise.
  const resolution: FrontEngagementResolutionState = {
    ...createOpenedFrontEngagementResolutionState(
      defaultEngagingUnit().unitType.stats.speed,
    ),
    ...overrides,
  };

  // The engagement holding that resolution. A defender met head on may fall
  // back only if it is the faster (§6.3.2), so its retreat is not settled yet.
  const engagement = createOpenedEngagementState(resolution);
  const front = { ...engagement, engagementResolutionState: resolution };

  // The engagement, for a move's engagement slot.
  return front;
}
