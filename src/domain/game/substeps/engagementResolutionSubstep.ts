import type { Board, UnitInstance, UnitPlacement } from '@entities';
import type { AssertExact } from '@utils';
import type { EngagementResolutionState } from './engagement';
import { unitInstanceSchema, unitPlacementSchema } from '@entities';
import { z } from 'zod';
import { engagementResolutionStateSchema } from './engagement';

/** The state of an engagement resolution substep. */
export interface EngagementState<TBoard extends Board> {
  /** The type of the substep. */
  substepType: 'engagementResolution';
  /** The unit that is engaging. */
  engagingUnit: UnitInstance;
  /** The target placement for the engaging unit. */
  targetPlacement: UnitPlacement<TBoard>;
  /** The resolution state of the engagement. */
  engagementResolutionState: EngagementResolutionState | undefined;
}

const _engagementStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('engagementResolution'),
  /** The unit that is engaging. */
  engagingUnit: unitInstanceSchema,
  /** The target placement for the engaging unit. */
  targetPlacement: unitPlacementSchema,
  /** The resolution state of the engagement. */
  engagementResolutionState: engagementResolutionStateSchema.or(z.undefined()),
});

type EngagementStateSchemaType = z.infer<typeof _engagementStateSchemaObject>;

/** The schema for the engagement state. */
export const engagementStateSchema: z.ZodType<EngagementState<Board>> =
  _engagementStateSchemaObject;

const _assertExactEngagementState: AssertExact<
  EngagementState<Board>,
  EngagementStateSchemaType
> = true;
