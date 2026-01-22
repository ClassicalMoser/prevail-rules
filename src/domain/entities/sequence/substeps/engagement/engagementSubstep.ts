import type { Board } from '@entities/board';
import type { UnitInstance } from '@entities/unit';
import type { UnitPlacement } from '@entities/unitLocation';
import type { AssertExact } from '@utils';
import type { EngagementResolutionState } from './engagementResolutionState';
import { unitInstanceSchema } from '@entities/unit';
import { unitPlacementSchema } from '@entities/unitLocation';
import { z } from 'zod';
import { engagementResolutionStateSchema } from './engagementResolutionState';

/** The state of an engagement resolution substep. */
export interface EngagementState<TBoard extends Board> {
  /** The type of the substep. */
  substepType: 'engagementResolution';
  /** The unit that is engaging. */
  engagingUnit: UnitInstance;
  /** The target placement for the engaging unit. */
  targetPlacement: UnitPlacement<TBoard>;
  /** The resolution state of the engagement. */
  engagementResolutionState: EngagementResolutionState;
  /** Whether the engagement is complete. */
  completed: boolean;
}

const _engagementStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('engagementResolution'),
  /** The unit that is engaging. */
  engagingUnit: unitInstanceSchema,
  /** The target placement for the engaging unit. */
  targetPlacement: unitPlacementSchema,
  /** The resolution state of the engagement. */
  engagementResolutionState: engagementResolutionStateSchema,
  /** Whether the engagement is complete. */
  completed: z.boolean(),
});

type EngagementStateSchemaType = z.infer<typeof _engagementStateSchemaObject>;

const _assertExactEngagementState: AssertExact<
  EngagementState<Board>,
  EngagementStateSchemaType
> = true;

/** The schema for the engagement state. */
export const engagementStateSchema: z.ZodType<EngagementState<Board>> =
  _engagementStateSchemaObject;
