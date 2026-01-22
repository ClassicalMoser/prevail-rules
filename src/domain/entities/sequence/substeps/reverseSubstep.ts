import type { Board } from '@entities/board';
import type { UnitPlacement, UnitWithPlacement } from '@entities/unitLocation';
import type { AssertExact } from '@utils';
import {
  unitPlacementSchema,
  unitWithPlacementSchema,
} from '@entities/unitLocation';
import { z } from 'zod';

/**
 * Composable substep that handles unit reversal after an attack.
 *
 * This is a **composable substep** - it can be reused in multiple contexts:
 * - Used in `AttackApplyState` (when unit reverses after an attack)
 *
 * The expected event query `getExpectedReverseEvent()` is composable and
 * can be called from any parent context that contains this state.
 */
export interface ReverseState<TBoard extends Board> {
  /** The type of the substep. */
  substepType: 'reverse';
  /** The unit that is reversing. */
  reversingUnit: UnitWithPlacement<TBoard>;
  /** The result of the reverse. */
  finalPosition: UnitPlacement<TBoard> | undefined;
  /** Whether the reverse has been completed. */
  completed: boolean;
}

/** The schema for the state of a reverse substep. */
const _reverseStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('reverse'),
  /** The unit that is reversing. */
  reversingUnit: unitWithPlacementSchema,
  /** The result of the reverse. */
  finalPosition: unitPlacementSchema.or(z.undefined()),
  /** Whether the reverse has been completed. */
  completed: z.boolean(),
});

type ReverseStateSchemaType = z.infer<typeof _reverseStateSchemaObject>;

// Assert that the reverse state is exact.
const _assertExactReverseState: AssertExact<
  ReverseState<any>,
  ReverseStateSchemaType
> = true;

/** The schema for the state of a reverse substep. */
export const reverseStateSchema: z.ZodObject<{
  substepType: z.ZodLiteral<'reverse'>;
  reversingUnit: z.ZodType<UnitWithPlacement<Board>>;
  finalPosition: z.ZodType<UnitPlacement<Board> | undefined>;
  completed: z.ZodType<boolean>;
}> = _reverseStateSchemaObject;
