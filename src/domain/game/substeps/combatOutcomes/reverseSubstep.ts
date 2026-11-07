import type { UnitInstance, UnitPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitInstanceSchema, unitPlacementSchema } from '@entities';
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
  /**
   * The unit that is reversing, by identity. A reverse can come due after a
   * retreat has already moved the unit, so where it stands is read from the
   * board rather than copied here.
   */
  reversingUnit: UnitInstance;
  /** The final position of the reversing unit. */
  finalPosition: UnitPlacement | 'pending';
  /** Whether the reverse has been completed. */
  completed: boolean;
}

const _reverseStateSchemaObject = z
  .object({
    substepType: z.literal('reverse'),
    reversingUnit: unitInstanceSchema,
    finalPosition: unitPlacementSchema.or(z.literal('pending')),
    completed: z.boolean(),
  })
  .strict();

type ReverseStateSchemaType = z.infer<typeof _reverseStateSchemaObject>;

export const reverseStateSchema: z.ZodType<ReverseState> =
  _reverseStateSchemaObject;

const _assertExactReverseState: AssertExact<
  ReverseState,
  ReverseStateSchemaType
> = true;
