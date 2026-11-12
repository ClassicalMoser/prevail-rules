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
 * - `AttackApplyState` (one for each player, named for the order the players
 *   hold initiative in)
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
   * TODO(misleading): "the first player's attack apply" reads as the first
   * player's blow, but the slot holds the result applied to the first
   * player's unit, as the substeps README says: `updateMeleeAttackApplyState`
   * writes it for the player whose unit takes the result. Settled with the
   * open question on `getMeleeAttackApplyState`'s `player`.
   *
   * Both units strike at once, and the slots are named for the order the
   * players hold initiative in: first and second. The applies take effect
   * second player's unit first (§7.5.6). Which colour holds the initiative is
   * a rule of the version being played; who owns an apply is read from its
   * `defendingUnit`.
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
