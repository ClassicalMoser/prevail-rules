import type { Coordinate } from '@entities';
import type { Commitment } from '@game/commitment';
import type { AssertExact } from '@utils';
import type { AttackApplyState } from './attackApplySubstep';
import { coordinateSchema } from '@entities';
import { commitmentSchema } from '@game/commitment';
import { z } from 'zod';
import { attackApplyStateSchema } from './attackApplySubstep';

/**
 * Context-specific substep that resolves melee combat.
 *
 * This is a **context-specific substep** - it's tied to the `ResolveMeleePhase`.
 * It contains composable substeps:
 * - `AttackApplyState` (one for each player - white and black)
 *
 * Unlike composable substeps, this state is only used in one specific context.
 * Repeated for each melee that needs to be resolved in a round.
 */
export interface MeleeResolutionState {
  /** The type of the substep. */
  substepType: 'meleeResolution';
  /** The location of the melee. */
  location: Coordinate;
  /** The state of the white player's attack apply. */
  whiteAttackApplyState: AttackApplyState | 'pending';
  /** The state of the black player's attack apply. */
  blackAttackApplyState: AttackApplyState | 'pending';
  /** The white player's commitment.*/
  whiteCommitment: Commitment;
  /** The black player's commitment. */
  blackCommitment: Commitment;
  /** Whether the melee resolution substep is complete. */
  completed: boolean;
}

const _meleeResolutionStateSchemaObject = z.object({
  blackAttackApplyState: attackApplyStateSchema.or(z.literal('pending')),
  blackCommitment: commitmentSchema,
  completed: z.boolean(),
  location: coordinateSchema,
  substepType: z.literal('meleeResolution'),
  whiteAttackApplyState: attackApplyStateSchema.or(z.literal('pending')),
  whiteCommitment: commitmentSchema,
});

type MeleeResolutionStateSchemaType = z.infer<
  typeof _meleeResolutionStateSchemaObject
>;

const _assertExactMeleeResolutionState: AssertExact<
  MeleeResolutionState,
  MeleeResolutionStateSchemaType
> = true;

export const meleeResolutionStateSchema: z.ZodType<MeleeResolutionState> =
  _meleeResolutionStateSchemaObject;
