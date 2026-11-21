import type { AssertExact } from '@utils';
import type { EngagementResolutionState } from './engagementResolutionState';
import { z } from 'zod';
import { ENGAGEMENT_RESOLUTION_SUBSTEP_TYPE } from '../substepType';
import { engagementResolutionStateSchema } from './engagementResolutionState';

/**
 * Composable substep that handles engagement resolution (flank, front, rear).
 * The engaging unit, and the space its move ends in, are the parent
 * movement's (`movingUnit`, `targetPlacement`).
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
  substepType: typeof ENGAGEMENT_RESOLUTION_SUBSTEP_TYPE;
  /** The resolution state of the engagement. */
  engagementResolutionState: EngagementResolutionState;
  /** Whether the engagement is complete. */
  completed: boolean;
}

const _engagementStateSchemaObject = z
  .object({
    completed: z.boolean(),
    engagementResolutionState: engagementResolutionStateSchema,
    substepType: z.literal(ENGAGEMENT_RESOLUTION_SUBSTEP_TYPE),
  })
  .strict();

type EngagementStateSchemaType = z.infer<typeof _engagementStateSchemaObject>;

/** The schema for an engagement a moving unit has started. */
export const engagementStateSchema: z.ZodType<EngagementState> =
  _engagementStateSchemaObject;

const _assertExactEngagementState: AssertExact<
  EngagementState,
  EngagementStateSchemaType
> = true;
