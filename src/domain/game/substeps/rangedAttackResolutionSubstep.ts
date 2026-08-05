import type { UnitInstance } from '@entities';
import type { Commitment } from '@game/commitment';
import type { AssertExact } from '@utils';
import type { AttackApplyState } from './attackApplySubstep';
import { unitInstanceSchema } from '@entities';
import { commitmentSchema } from '@game/commitment';
import { z } from 'zod';
import { attackApplyStateSchema } from './attackApplySubstep';

/**
 * Context-specific substep that resolves ranged attack commands.
 *
 * This is a **context-specific substep** - it's tied to the `IssueCommandsPhase`.
 * It contains a composable substep:
 * - `AttackApplyState` (applies the result of the ranged attack)
 *
 * Unlike composable substeps, this state is only used in one specific context.
 */
export interface RangedAttackResolutionState {
  /** The type of the substep. */
  substepType: 'commandResolution';
  /** The type of command resolution. */
  commandResolutionType: 'rangedAttack';
  /** The unit that is attacking. */
  attackingUnit: UnitInstance;
  /** The unit that is being attacked. */
  defendingUnit: UnitInstance;
  /** The supporting units. */
  supportingUnits: UnitInstance[];
  /** The state of the attack apply. */
  attackApplyState: AttackApplyState | 'pending';
  /** The commitment of the attacking player. */
  attackingCommitment: Commitment;
  /** The commitment of the defending player. */
  defendingCommitment: Commitment;
  /** Whether the ranged attack resolution substep is complete. */
  completed: boolean;
}

const _rangedAttackResolutionStateSchemaObject = z.object({
  attackApplyState: attackApplyStateSchema.or(z.literal('pending')),
  attackingCommitment: commitmentSchema,
  attackingUnit: unitInstanceSchema,
  commandResolutionType: z.literal('rangedAttack'),
  completed: z.boolean(),
  defendingCommitment: commitmentSchema,
  defendingUnit: unitInstanceSchema,
  substepType: z.literal('commandResolution'),
  supportingUnits: z.array(unitInstanceSchema),
});

type RangedAttackResolutionStateSchemaType = z.infer<
  typeof _rangedAttackResolutionStateSchemaObject
>;

const _assertExactRangedAttackResolutionState: AssertExact<
  RangedAttackResolutionState,
  RangedAttackResolutionStateSchemaType
> = true;

export const rangedAttackResolutionStateSchema: z.ZodType<RangedAttackResolutionState> =
  _rangedAttackResolutionStateSchemaObject;
