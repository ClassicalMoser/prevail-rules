import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import type { RoutState } from './routSubstep';

import { unitInstanceSchema } from '@entities/unit';
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
  unitsLostSupport: Set<UnitInstance> | undefined;
  /** The rout discard penalty state (if units were routed). */
  routState: RoutState | undefined;
  /** Whether the rally resolution substep is complete. */
  completed: boolean;
}

const _rallyResolutionStateSchemaObject = z.object({
  /** Whether the player chose to rally. */
  playerRallied: z.boolean(),
  /** Whether the rally has been resolved. */
  rallyResolved: z.boolean(),
  /** Units that lost support after the rally. */
  unitsLostSupport: z.set(unitInstanceSchema).or(z.undefined()),
  /** The rout discard penalty state (if units were routed). */
  routState: routStateSchema.or(z.undefined()),
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
  unitsLostSupport: z.ZodType<Set<UnitInstance> | undefined>;
  routState: z.ZodType<RoutState | undefined>;
  completed: z.ZodType<boolean>;
}> = _rallyResolutionStateSchemaObject;
