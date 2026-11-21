import type { Coordinate } from '@entities';
import type { Commitment } from '@game/commitment';
import type { AssertExact } from '@utils';
import type { AttackApplyState } from '../combatOutcomes';
import { coordinateSchema } from '@entities';
import { commitmentSchema } from '@game/commitment';
import { z } from 'zod';
import { MELEE_RESOLUTION_SUBSTEP_TYPE } from '../substepType';
import { attackApplyStateSchema } from '../combatOutcomes';

/**
 * Context-specific substep that resolves melee combat.
 *
 * This is a **context-specific substep** - it's tied to the `ResolveMeleePhase`.
 * It contains composable substeps:
 * - {@link AttackApplyState} (one for each player's unit, the attack it
 *   takes, named for the order the players hold initiative in)
 *
 * Unlike composable substeps, this state is only used in one specific context.
 * Repeated for each melee that needs to be resolved in a round.
 */
export interface MeleeResolutionState {
  /** The type of the substep. */
  substepType: typeof MELEE_RESOLUTION_SUBSTEP_TYPE;
  /** The location of the melee. */
  location: Coordinate;
  /**
   * The apply of the second player's attack on the first player's unit:
   * the result that unit takes.
   *
   * Both units strike at once, and the slots are named for the order the
   * players hold initiative in: first and second. The applies take effect
   * second player's unit first (§7.5.6). Which colour holds the initiative is
   * a rule of the version being played; who owns an apply is read from its
   * `defendingUnit`.
   */
  attackOnFirstPlayerApplyState: AttackApplyState | 'pending';
  /** The apply of the first player's attack on the second player's unit. */
  attackOnSecondPlayerApplyState: AttackApplyState | 'pending';
  /** The first player's commitment.*/
  firstPlayerCommitment: Commitment;
  /** The second player's commitment. */
  secondPlayerCommitment: Commitment;
  /** Whether the melee resolution substep is complete. */
  completed: boolean;
}

const _meleeResolutionStateSchemaObject = z
  .object({
    attackOnFirstPlayerApplyState: attackApplyStateSchema.or(
      z.literal('pending'),
    ),
    firstPlayerCommitment: commitmentSchema,
    completed: z.boolean(),
    location: coordinateSchema,
    substepType: z.literal(MELEE_RESOLUTION_SUBSTEP_TYPE),
    attackOnSecondPlayerApplyState: attackApplyStateSchema.or(
      z.literal('pending'),
    ),
    secondPlayerCommitment: commitmentSchema,
  })
  .strict();

type MeleeResolutionStateSchemaType = z.infer<
  typeof _meleeResolutionStateSchemaObject
>;

/** The schema for one melee being resolved, in one space. */
export const meleeResolutionStateSchema: z.ZodType<MeleeResolutionState> =
  _meleeResolutionStateSchemaObject;

const _assertExactMeleeResolutionState: AssertExact<
  MeleeResolutionState,
  MeleeResolutionStateSchemaType
> = true;
