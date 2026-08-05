import type { UnitInstance, UnitPlacement } from '@entities';
import type { AssertExact } from '@utils';
import type { EngagementResolutionState } from './engagementResolutionState';
import { unitInstanceSchema, unitPlacementSchema } from '@entities';
import { z } from 'zod';
import { engagementResolutionStateSchema } from './engagementResolutionState';

/**
 * Composable substep that handles engagement resolution (flank, front, rear).
 *
 * This is a **composable substep** - it can be reused in multiple contexts:
 * - Used in `MovementResolutionState` (when movement results in engagement)
 *
 * It contains nested resolution logic that can trigger:
 * - `RoutState` (for rear engagements)
 * - Retreat logic (for front engagements)
 *
 * The expected event query `getExpectedEngagementEvent()` is composable and
 * can be called from any parent context that contains this state.
 */
export interface EngagementState {
  /** The type of the substep. */
  substepType: 'engagementResolution';
  /** The unit that is engaging. */
  engagingUnit: UnitInstance;
  /** The target placement of the engagement. */
  targetPlacement: UnitPlacement;
  /** The resolution state of the engagement. */
  engagementResolutionState: EngagementResolutionState;
  /** Whether the engagement is complete. */
  completed: boolean;
}

const _engagementStateSchemaObject = z.object({
  completed: z.boolean(),
  engagementResolutionState: engagementResolutionStateSchema,
  engagingUnit: unitInstanceSchema,
  substepType: z.literal('engagementResolution'),
  targetPlacement: unitPlacementSchema,
});

type EngagementStateSchemaType = z.infer<typeof _engagementStateSchemaObject>;

const _assertExactEngagementState: AssertExact<
  EngagementState,
  EngagementStateSchemaType
> = true;

export const engagementStateSchema: z.ZodType<EngagementState> =
  _engagementStateSchemaObject;
