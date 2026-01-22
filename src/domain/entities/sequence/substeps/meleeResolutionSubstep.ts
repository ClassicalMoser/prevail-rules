import type { Board } from '@entities/board';
import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import type { Commitment } from '../commitment';
import type { AttackApplyState } from './attackApplySubstep';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';
import { commitmentSchema } from '../commitment';
import { attackApplyStateSchema } from './attackApplySubstep';

/** The state of a particular melee as it is being resolved.
 * Repeated for each melee that needs to be resolved in a round.
 */
export interface MeleeResolutionState<TBoard extends Board> {
  /** The type of the substep. */
  substepType: 'meleeResolution';
  /** The white player's unit that is resolving the melee. */
  whiteUnit: UnitInstance;
  /** The black player's unit that is resolving the melee. */
  blackUnit: UnitInstance;
  /** The white player's commitment.
   */
  whiteCommitment: Commitment;
  /** The black player's commitment.
   */
  blackCommitment: Commitment;
  /** Whether the white player's result has been resolved. */
  whiteResultResolved: boolean;
  /** Whether the black player's result has been resolved. */
  blackResultResolved: boolean;
  /** The state of the attack apply substep for the white player's unit. */
  whiteAttackApplyState: AttackApplyState<TBoard> | undefined;
  /** The state of the attack apply substep for the black player's unit. */
  blackAttackApplyState: AttackApplyState<TBoard> | undefined;
}

/** The schema for the state of the melee resolution substep. */
const _meleeResolutionStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('meleeResolution'),
  /** The white player's unit that is resolving the melee. */
  whiteUnit: unitInstanceSchema,
  /** The black player's unit that is resolving the melee. */
  blackUnit: unitInstanceSchema,
  /** The white player's commitment. */
  whiteCommitment: commitmentSchema,
  /** The black player's commitment. */
  blackCommitment: commitmentSchema,
  /** Whether the white player's result has been resolved. */
  whiteResultResolved: z.boolean(),
  /** Whether the black player's result has been resolved. */
  blackResultResolved: z.boolean(),
  /** The state of the attack apply substep for the white player's unit. */
  whiteAttackApplyState: attackApplyStateSchema.or(z.undefined()),
  /** The state of the attack apply substep for the black player's unit. */
  blackAttackApplyState: attackApplyStateSchema.or(z.undefined()),
});

type MeleeResolutionStateSchemaType = z.infer<
  typeof _meleeResolutionStateSchemaObject
>;

const _assertExactMeleeResolutionState: AssertExact<
  MeleeResolutionState<Board>,
  MeleeResolutionStateSchemaType
> = true;

/** The schema for the state of the melee resolution substep. */
export const meleeResolutionStateSchema: z.ZodType<
  MeleeResolutionState<Board>
> = _meleeResolutionStateSchemaObject;
