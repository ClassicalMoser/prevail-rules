import type { Board, UnitInstance } from '@entities';
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
export interface AttackApplyState<TBoard extends Board> {
  /** The type of the substep. */
  substepType: 'attackApply';
  /** The unit that is being attacked. */
  defendingUnit: UnitInstance;
  /** The result of the attack. */
  attackResult: AttackResult;
  /** The state of the rout. */
  routState: RoutState | undefined;
  /** The state of the retreat. */
  retreatState: RetreatState<TBoard> | undefined;
  /** The state of the reverse. */
  reverseState: ReverseState<TBoard> | undefined;
  /** Whether the attack apply substep is complete. */
  completed: boolean;
}

/** The schema for the state of the attack apply substep. */
const _attackApplyStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('attackApply'),
  /** The unit that is being attacked. */
  defendingUnit: unitInstanceSchema,
  /** The result of the attack. */
  attackResult: attackResultSchema,
  /** The state of the rout. */
  routState: routStateSchema.or(z.undefined()),
  /** The state of the retreat. */
  retreatState: retreatStateSchema.or(z.undefined()),
  /** The state of the reverse. */
  reverseState: reverseStateSchema.or(z.undefined()),
  /** Whether the attack apply substep is complete. */
  completed: z.boolean(),
});

type AttackApplyStateSchemaType = z.infer<typeof _attackApplyStateSchemaObject>;

/** The schema for the state of the attack apply substep. */
export const attackApplyStateSchema: z.ZodObject<{
  substepType: z.ZodLiteral<'attackApply'>;
  defendingUnit: z.ZodType<UnitInstance>;
  attackResult: z.ZodType<AttackResult>;
  routState: z.ZodType<RoutState | undefined>;
  retreatState: z.ZodType<RetreatState<Board> | undefined>;
  reverseState: z.ZodType<ReverseState<Board> | undefined>;
  completed: z.ZodType<boolean>;
}> = _attackApplyStateSchemaObject;

// Assert that the attack apply state is exact.
const _assertExactAttackApplyState: AssertExact<
  AttackApplyState<Board>,
  AttackApplyStateSchemaType
> = true;
