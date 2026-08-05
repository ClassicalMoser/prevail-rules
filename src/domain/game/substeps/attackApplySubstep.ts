import type { UnitInstance } from '@entities';
import type { AttackResult } from '@game/attackResult';
import type { AssertExact } from '@utils';
import type { RetreatState } from './retreatSubstep';
import type { ReverseState } from './reverseSubstep';
import type { RoutState } from './routSubstep';
import { unitInstanceSchema } from '@entities';
import { attackResultSchema } from '@game/attackResult';
import { z } from 'zod';
import { retreatStateSchema } from './retreatSubstep';
import { reverseStateSchema } from './reverseSubstep';
import { routStateSchema } from './routSubstep';

/**
 * Composable substep that applies the result of an attack.
 *
 * This is a **composable substep** - it can be reused in multiple contexts:
 * - Used in `RangedAttackResolutionState` (for ranged attacks)
 * - Used in `MeleeResolutionState` (for melee combat, one per player)
 *
 * It contains nested composable substeps:
 * - `RoutState` (if unit routed)
 * - `RetreatState` (if unit retreated)
 * - `ReverseState` (if unit reversed)
 *
 * The expected event query `getExpectedAttackApplyEvent()` is composable and
 * can be called from any parent context that contains this state.
 */
export interface AttackApplyState {
  /** The type of the substep. */
  substepType: 'attackApply';
  /** The unit that is being attacked. */
  defendingUnit: UnitInstance;
  /** The result of the attack. */
  attackResult: AttackResult;
  /** The state of the reverse. */
  reverseState: ReverseState | 'pending';
  /** The state of the retreat. */
  retreatState: RetreatState | 'pending';
  /** The state of the rout. */
  routState: RoutState | 'pending';
  /** Whether the attack apply substep is complete. */
  completed: boolean;
}

const _attackApplyStateSchemaObject = z.object({
  attackResult: attackResultSchema,
  completed: z.boolean(),
  defendingUnit: unitInstanceSchema,
  retreatState: retreatStateSchema.or(z.literal('pending')),
  reverseState: reverseStateSchema.or(z.literal('pending')),
  routState: routStateSchema.or(z.literal('pending')),
  substepType: z.literal('attackApply'),
});

type AttackApplyStateSchemaType = z.infer<typeof _attackApplyStateSchemaObject>;

const _assertExactAttackApplyState: AssertExact<
  AttackApplyState,
  AttackApplyStateSchemaType
> = true;

export const attackApplyStateSchema: z.ZodType<AttackApplyState> =
  _attackApplyStateSchemaObject;
