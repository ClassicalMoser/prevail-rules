import type { Board } from '@entities/board';
import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import type { Commitment } from '../commitment';
import type { AttackApplyState } from './attackApplySubstep';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';
import { commitmentSchema } from '../commitment';
import { attackApplyStateSchema } from './attackApplySubstep';

export interface RangedAttackResolutionState<_TBoard extends Board> {
  /** The type of the substep. */
  substepType: 'commandResolution';
  /** The type of command resolution. */
  commandResolutionType: 'rangedAttack';
  /** The unit that is attacking. */
  attackingUnit: UnitInstance;
  /** The unit that is being attacked. */
  defendingUnit: UnitInstance;
  /** The supporting units. */
  supportingUnits: Set<UnitInstance>;
  /** The commitment of the attacking player. */
  attackingCommitment: Commitment;
  /** The commitment of the defending player. */
  defendingCommitment: Commitment;
  /** The state of the attack apply substep. */
  attackApplyState: AttackApplyState;
}

/** The schema for the state of the ranged attack resolution substep. */
const _rangedAttackResolutionStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('commandResolution'),
  /** The type of command resolution. */
  commandResolutionType: z.literal('rangedAttack'),
  /** The unit that is attacking. */
  attackingUnit: unitInstanceSchema,
  /** The unit that is being attacked. */
  defendingUnit: unitInstanceSchema,
  /** The supporting units. */
  supportingUnits: z.set(unitInstanceSchema),
  /** The commitment of the attacking player. */
  attackingCommitment: commitmentSchema,
  /** The commitment of the defending player. */
  defendingCommitment: commitmentSchema,
  /** The state of the attack apply substep. */
  attackApplyState: attackApplyStateSchema,
});

type RangedAttackResolutionStateSchemaType = z.infer<
  typeof _rangedAttackResolutionStateSchemaObject
>;

const _assertExactRangedAttackResolutionState: AssertExact<
  RangedAttackResolutionState<Board>,
  RangedAttackResolutionStateSchemaType
> = true;

/** The schema for the state of the ranged attack resolution substep. */
export const rangedAttackResolutionStateSchema: z.ZodObject<{
  substepType: z.ZodLiteral<'commandResolution'>;
  commandResolutionType: z.ZodLiteral<'rangedAttack'>;
  attackingUnit: z.ZodType<UnitInstance>;
  defendingUnit: z.ZodType<UnitInstance>;
  supportingUnits: z.ZodType<Set<UnitInstance>>;
  attackingCommitment: z.ZodType<Commitment>;
  defendingCommitment: z.ZodType<Commitment>;
  attackApplyState: z.ZodType<AttackApplyState>;
}> = _rangedAttackResolutionStateSchemaObject;
