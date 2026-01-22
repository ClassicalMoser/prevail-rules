import type { Board } from '@entities/board';
import type { RoutState } from '@entities/sequence';
import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import type { AttackResult } from '../attackResult';
import type { RetreatState } from './retreatSubstep';
import type { ReverseState } from './reverseSubstep';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';
import { attackResultSchema } from '../attackResult';
import { retreatStateSchema } from './retreatSubstep';
import { reverseStateSchema } from './reverseSubstep';
import { routStateSchema } from './routSubstep';

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

// Assert that the attack apply state is exact.
const _assertExactAttackApplyState: AssertExact<
  AttackApplyState<any>,
  AttackApplyStateSchemaType
> = true;

/** The schema for the state of the attack apply substep. */
export const attackApplyStateSchema: z.ZodObject<{
  substepType: z.ZodLiteral<'attackApply'>;
  defendingUnit: z.ZodType<UnitInstance>;
  attackResult: z.ZodType<AttackResult>;
  routState: z.ZodType<RoutState | undefined>;
  retreatState: z.ZodType<RetreatState<any> | undefined>;
  reverseState: z.ZodType<ReverseState<any> | undefined>;
  completed: z.ZodType<boolean>;
}> = _attackApplyStateSchemaObject;
