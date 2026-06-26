import type { UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import type { RoutState } from './routSubstep';

import { unitInstanceSchema } from '@entities';
import { z } from 'zod';
import { routStateSchema } from './routSubstep';

/**
 * Context-specific substep that resolves unit support consequences after a rally.
 *
 * This is a **context-specific substep** - it's tied to the `CleanupPhase`.
 * It contains a composable substep:
 * - `RoutState` (if units lost support and were routed)
 *
 * Unlike composable substeps, this state is only used in one specific context.
 * After cards return to hand, we need to check if any units lost support.
 * If units were routed, the player must pay a discard penalty.
 */
export interface RallyResolutionState {
  /** Whether the player chose to rally. */
  playerRallied: boolean;
  /** Whether the rally has been resolved. */
  rallyResolved: boolean;
  /** Units that lost support after the rally. */
  unitsLostSupport: UnitInstance[] | 'pending';
  /** The rout discard penalty state (if units were routed). */
  routState: RoutState | 'pending';
  /** Whether the rally resolution substep is complete. */
  completed: boolean;
}

const _rallyResolutionStateSchemaObject = z.object({
  /** Whether the player chose to rally. */
  playerRallied: z.boolean(),
  /** Whether the rally has been resolved. */
  rallyResolved: z.boolean(),
  /** Units that lost support after the rally. */
  unitsLostSupport: z.array(unitInstanceSchema).or(z.literal('pending')),
  /** The rout discard penalty state (if units were routed). */
  routState: routStateSchema.or(z.literal('pending')),
  /** Whether the rally resolution substep is complete. */
  completed: z.boolean(),
});

type RallyResolutionStateSchemaType = z.infer<
  typeof _rallyResolutionStateSchemaObject
>;

const _assertExactRallyResolutionState: AssertExact<
  RallyResolutionState,
  RallyResolutionStateSchemaType
> = true;

/** The schema for the rally resolution state. */
export const rallyResolutionStateSchema: z.ZodObject<{
  playerRallied: z.ZodBoolean;
  rallyResolved: z.ZodBoolean;
  unitsLostSupport: z.ZodType<UnitInstance[] | 'pending'>;
  routState: z.ZodType<RoutState | 'pending'>;
  completed: z.ZodType<boolean>;
}> = _rallyResolutionStateSchemaObject;
