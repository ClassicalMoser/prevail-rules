import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import type { RoutDiscardState } from './routDiscardSubstep';

import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';
import { routDiscardStateSchema } from './routDiscardSubstep';

/**
 * Tracks the state of resolving unit support consequences after a rally.
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
  routDiscardState: RoutDiscardState | undefined;
}

const _rallyResolutionStateSchemaObject = z.object({
  /** Whether the player chose to rally. */
  playerRallied: z.boolean(),
  /** Whether the rally has been resolved. */
  rallyResolved: z.boolean(),
  /** Units that lost support after the rally. */
  unitsLostSupport: z.set(unitInstanceSchema).or(z.undefined()),
  /** The rout discard penalty state (if units were routed). */
  routDiscardState: routDiscardStateSchema.or(z.undefined()),
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
  routDiscardState: z.ZodType<RoutDiscardState | undefined>;
}> = _rallyResolutionStateSchemaObject;
