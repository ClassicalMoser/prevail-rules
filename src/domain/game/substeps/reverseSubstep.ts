import type { UnitPlacement, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitPlacementSchema, unitWithPlacementSchema } from '@entities';
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
export interface ReverseState {
  /** The type of the substep. */
  substepType: 'reverse';
  /** The unit that is reversing. */
  reversingUnit: UnitWithPlacement;
  /** The final position of the reversing unit. */
  finalPosition: UnitPlacement | 'pending';
  /** Whether the reverse has been completed. */
  completed: boolean;
}

const _reverseStateSchemaObject = z
  .object({
    substepType: z.literal('reverse'),
    reversingUnit: unitWithPlacementSchema,
    finalPosition: unitPlacementSchema.or(z.literal('pending')),
    completed: z.boolean(),
  })
  .strict();

type ReverseStateSchemaType = z.infer<typeof _reverseStateSchemaObject>;

const _assertExactReverseState: AssertExact<
  ReverseState,
  ReverseStateSchemaType
> = true;

export const reverseStateSchema: z.ZodType<ReverseState> =
  _reverseStateSchemaObject;
