import type { UnitInstance } from '@entities';
import type { Commitment } from '@game/commitment';
import type { AssertExact } from '@utils';
import type { AttackApplyState } from '../combatOutcomes';
import { unitInstanceSchema } from '@entities';
import { commitmentSchema } from '@game/commitment';
import { z } from 'zod';
import { attackApplyStateSchema } from '../combatOutcomes';

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
  /** The unit that is firing, named first (§4.3.11 step 1). */
  attackingUnit: UnitInstance;
  /**
   * The unit being shot at. `'pending'` from the moment the shooter is named
   * until its owner, having committed a card or not, names the target: a
   * Range card reaches one space further, so the commitment comes first
   * (§4.3.11 steps 2–3).
   */
  defendingUnit: UnitInstance | 'pending';
  /** Units spending their own shots on this one; `'pending'` with the target. */
  supportingUnits: UnitInstance[] | 'pending';
  /** The state of the attack apply. */
  attackApplyState: AttackApplyState | 'pending';
  /** The shooter's commitment, made before the target is named. */
  attackingCommitment: Commitment;
  /** The target's commitment, for Defence, made once it is named (B1). */
  defendingCommitment: Commitment;
  /** Whether the ranged attack resolution substep is complete. */
  completed: boolean;
}

const _rangedAttackResolutionStateSchemaObject = z
  .object({
    attackApplyState: attackApplyStateSchema.or(z.literal('pending')),
    attackingCommitment: commitmentSchema,
    attackingUnit: unitInstanceSchema,
    commandResolutionType: z.literal('rangedAttack'),
    completed: z.boolean(),
    defendingCommitment: commitmentSchema,
    defendingUnit: unitInstanceSchema.or(z.literal('pending')),
    substepType: z.literal('commandResolution'),
    supportingUnits: z.array(unitInstanceSchema).or(z.literal('pending')),
  })
  .strict();

type RangedAttackResolutionStateSchemaType = z.infer<
  typeof _rangedAttackResolutionStateSchemaObject
>;

export const rangedAttackResolutionStateSchema: z.ZodType<RangedAttackResolutionState> =
  _rangedAttackResolutionStateSchemaObject;

const _assertExactRangedAttackResolutionState: AssertExact<
  RangedAttackResolutionState,
  RangedAttackResolutionStateSchemaType
> = true;
