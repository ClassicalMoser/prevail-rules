import type { UnitInstance} from '@entities/unit';
import type { AssertExact } from '@utils';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';

/**
 * Tracks the state of resolving unit support consequences after a rally.
 * After cards return to hand, we need to check if any units lost support.
 */
export interface RallyResolutionState {
  /** Whether the player chose to rally. */
  playerRallied: boolean;
  /** Whether the rally has been resolved. */
  rallyResolved: boolean;
  /** Units that lost support after the rally. */
  unitsLostSupport: Set<UnitInstance> | undefined;
}

const _rallyResolutionStateSchemaObject = z.object({
  /** Whether the player chose to rally. */
  playerRallied: z.boolean(),
  /** Whether the rally has been resolved. */
  rallyResolved: z.boolean(),
  /** Units that lost support after the rally. */
  unitsLostSupport: z.set(unitInstanceSchema).or(z.undefined()),
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
}> = _rallyResolutionStateSchemaObject;
