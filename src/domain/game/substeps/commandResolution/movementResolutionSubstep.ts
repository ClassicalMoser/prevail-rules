import type { UnitInstance, UnitPlacement } from '@entities';
import type { Commitment } from '@game/commitment';
import type { AssertExact } from '@utils';
import type { EngagementState } from '../engagement';
import { commitmentSchema } from '@game/commitment';
import { z } from 'zod';
import { COMMAND_RESOLUTION_SUBSTEP_TYPE } from '../substepType';
import { engagementStateSchema } from '../engagement';
import { unitInstanceSchema, unitPlacementSchema } from '@entities';

/**
 * Context-specific substep that resolves movement commands.
 *
 * This is a **context-specific substep** - it's tied to the `IssueCommandsPhase`.
 * It contains a composable substep:
 * - {@link EngagementState} (if movement results in engagement)
 *
 * Unlike composable substeps, this state is only used in one specific context.
 */
export interface MovementResolutionState {
  /** The type of the substep. */
  substepType: typeof COMMAND_RESOLUTION_SUBSTEP_TYPE;
  /** The type of command resolution. */
  commandResolutionType: 'movement';
  /**
   * The unit that is moving, by identity. Where it stands is the board's: on
   * the space it set off from until its move is written, and where the move
   * ends once it has arrived there (`targetPlacement`).
   */
  movingUnit: UnitInstance;
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
}

const _movementResolutionStateSchemaObject = z
  .object({
    commandResolutionType: z.literal('movement'),
    commitment: commitmentSchema,
    engagementState: engagementStateSchema.or(z.literal('pending')),
    moveCommander: z.boolean().or(z.literal('pending')),
    movingUnit: unitInstanceSchema,
    substepType: z.literal(COMMAND_RESOLUTION_SUBSTEP_TYPE),
    targetPlacement: unitPlacementSchema.or(z.literal('pending')),
  })
  .strict();

type MovementResolutionStateSchemaType = z.infer<
  typeof _movementResolutionStateSchemaObject
>;

/** The schema for one unit's move under a Move order. */
export const movementResolutionStateSchema: z.ZodType<MovementResolutionState> =
  _movementResolutionStateSchemaObject;

const _assertExactMovementResolutionState: AssertExact<
  MovementResolutionState,
  MovementResolutionStateSchemaType
> = true;
