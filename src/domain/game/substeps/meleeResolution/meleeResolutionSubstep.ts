import type { Coordinate } from '@entities';
import type { Commitment } from '@game/commitment';
import type { AssertExact } from '@utils';
import type { AttackApplyState } from '../combatOutcomes';
import { coordinateSchema } from '@entities';
import { commitmentSchema } from '@game/commitment';
import { z } from 'zod';
import { attackApplyStateSchema } from '../combatOutcomes';

/**
 * Context-specific substep that resolves melee combat.
 *
 * This is a **context-specific substep** - it's tied to the `ResolveMeleePhase`.
 * It contains composable substeps:
 * - `AttackApplyState` (one for each player, in initiative order)
 *
 * Unlike composable substeps, this state is only used in one specific context.
 * Repeated for each melee that needs to be resolved in a round.
 */
export interface MeleeResolutionState {
  /** The type of the substep. */
  substepType: 'meleeResolution';
  /** The location of the melee. */
  location: Coordinate;
  /**
   * The state of the first player's attack apply.
   *
   * Both units strike at once and their applies resolve one at a time, in
   * initiative order, so the slots are named for that order. Which colour
   * holds the initiative is a rule of the version being played; who owns an
   * apply is read from its `defendingUnit`.
   */
  firstPlayerAttackApplyState: AttackApplyState | 'pending';
  /** The state of the second player's attack apply. */
  secondPlayerAttackApplyState: AttackApplyState | 'pending';
  /** The first player's commitment.*/
  firstPlayerCommitment: Commitment;
  /** The second player's commitment. */
  secondPlayerCommitment: Commitment;
  /** Whether the melee resolution substep is complete. */
  completed: boolean;
}

const _meleeResolutionStateSchemaObject = z
  .object({
    firstPlayerAttackApplyState: attackApplyStateSchema.or(
      z.literal('pending'),
    ),
    firstPlayerCommitment: commitmentSchema,
    completed: z.boolean(),
    location: coordinateSchema,
    substepType: z.literal('meleeResolution'),
    secondPlayerAttackApplyState: attackApplyStateSchema.or(
      z.literal('pending'),
    ),
    secondPlayerCommitment: commitmentSchema,
  })
  .strict();

type MeleeResolutionStateSchemaType = z.infer<
  typeof _meleeResolutionStateSchemaObject
>;

export const meleeResolutionStateSchema: z.ZodType<MeleeResolutionState> =
  _meleeResolutionStateSchemaObject;

const _assertExactMeleeResolutionState: AssertExact<
  MeleeResolutionState,
  MeleeResolutionStateSchemaType
> = true;
