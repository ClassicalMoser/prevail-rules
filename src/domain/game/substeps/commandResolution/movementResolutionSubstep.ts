import type { UnitPlacement, UnitWithPlacement } from '@entities';
import type { Commitment } from '@game/commitment';
import type { AssertExact } from '@utils';
import type { EngagementState } from '../engagement';
import { commitmentSchema } from '@game/commitment';
import { z } from 'zod';
import { engagementStateSchema } from '../engagement';
import { unitPlacementSchema, unitWithPlacementSchema } from '@entities';

/**
 * Context-specific substep that resolves movement commands.
 *
 * This is a **context-specific substep** - it's tied to the `IssueCommandsPhase`.
 * It contains a composable substep:
 * - `EngagementState` (if movement results in engagement)
 *
 * Unlike composable substeps, this state is only used in one specific context.
 */
export interface MovementResolutionState {
  /** The type of the substep. */
  substepType: 'commandResolution';
  /** The type of command resolution. */
  commandResolutionType: 'movement';
  /** The unit that is moving, and where it now stands. */
  movingUnit: UnitWithPlacement;
  /**
   * Where the move ends. `'pending'` from the moment the unit is chosen
   * until its owner, having committed a card or not, writes the move
   * (§4.3.10).
   */
  targetPlacement: UnitPlacement | 'pending';
  /** Whether the commander rides along; `'pending'` until the move is written. */
  moveCommander: boolean | 'pending';
  /** The commitment of the moving player. */
  commitment: Commitment;
  /** The engagement state of the movement. */
  engagementState: EngagementState | 'pending';
  /** Whether the movement resolution substep is complete. */
  completed: boolean;
}

const _movementResolutionStateSchemaObject = z
  .object({
    commandResolutionType: z.literal('movement'),
    commitment: commitmentSchema,
    completed: z.boolean(),
    engagementState: engagementStateSchema.or(z.literal('pending')),
    moveCommander: z.boolean().or(z.literal('pending')),
    movingUnit: unitWithPlacementSchema,
    substepType: z.literal('commandResolution'),
    targetPlacement: unitPlacementSchema.or(z.literal('pending')),
  })
  .strict();

type MovementResolutionStateSchemaType = z.infer<
  typeof _movementResolutionStateSchemaObject
>;

export const movementResolutionStateSchema: z.ZodType<MovementResolutionState> =
  _movementResolutionStateSchemaObject;

const _assertExactMovementResolutionState: AssertExact<
  MovementResolutionState,
  MovementResolutionStateSchemaType
> = true;
