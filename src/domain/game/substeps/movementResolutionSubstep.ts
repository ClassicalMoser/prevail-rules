import type { UnitPlacement, UnitWithPlacement } from '@entities';
import type { Commitment } from '@game/commitment';
import type { AssertExact } from '@utils';
import type { EngagementState } from './engagement';
import { commitmentSchema } from '@game/commitment';
import { z } from 'zod';
import { engagementStateSchema } from './engagement';
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
  /** The unit that is moving. */
  movingUnit: UnitWithPlacement;
  /** The target placement of the movement. */
  targetPlacement: UnitPlacement;
  /** Whether to move the commander with the unit. */
  moveCommander: boolean;
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
    moveCommander: z.boolean(),
    movingUnit: unitWithPlacementSchema,
    substepType: z.literal('commandResolution'),
    targetPlacement: unitPlacementSchema,
  })
  .strict();

type MovementResolutionStateSchemaType = z.infer<
  typeof _movementResolutionStateSchemaObject
>;

const _assertExactMovementResolutionState: AssertExact<
  MovementResolutionState,
  MovementResolutionStateSchemaType
> = true;

export const movementResolutionStateSchema: z.ZodType<MovementResolutionState> =
  _movementResolutionStateSchemaObject;
