import type { Board } from '@entities/board';
import type { UnitPlacement, UnitWithPlacement } from '@entities/unitLocation';
import type { AssertExact } from '@utils';
import type { Commitment } from '../commitment';
import type { EngagementState } from './engagement';
import {
  unitPlacementSchema,
  unitWithPlacementSchema,
} from '@entities/unitLocation';
import { z } from 'zod';
import { commitmentSchema } from '../commitment';
import { engagementStateSchema } from './engagement';

/**
 * Context-specific substep that resolves movement commands.
 *
 * This is a **context-specific substep** - it's tied to the `IssueCommandsPhase`.
 * It contains a composable substep:
 * - `EngagementState` (if movement results in engagement)
 *
 * Unlike composable substeps, this state is only used in one specific context.
 */
export interface MovementResolutionState<TBoard extends Board> {
  /** The type of the substep. */
  substepType: 'commandResolution';
  /** The type of command resolution. */
  commandResolutionType: 'movement';
  /** The unit that is moving. */
  movingUnit: UnitWithPlacement<TBoard>;
  /** The target placement for the unit. */
  targetPlacement: UnitPlacement<TBoard>;
  /** Whether to move the commander with the unit. */
  moveCommander: boolean;
  /** The commitment of the moving player. */
  commitment: Commitment;
  /** The engagement state. */
  engagementState: EngagementState<TBoard> | undefined;
  /** Whether the movement resolution substep is complete. */
  completed: boolean;
}

/** The schema for the state of the movement resolution substep. */
const _movementResolutionStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('commandResolution'),
  /** The type of command resolution. */
  commandResolutionType: z.literal('movement'),
  /** The unit that is moving. */
  movingUnit: unitWithPlacementSchema,
  /** The target placement for the unit. */
  targetPlacement: unitPlacementSchema,
  /** Whether to move the commander with the unit. */
  moveCommander: z.boolean(),
  /** The commitment of the moving player. */
  commitment: commitmentSchema,
  /** The engagement state. */
  engagementState: engagementStateSchema.or(z.undefined()),
  /** Whether the movement resolution substep is complete. */
  completed: z.boolean(),
});

type MovementResolutionStateSchemaType = z.infer<
  typeof _movementResolutionStateSchemaObject
>;

const _assertExactMovementResolutionState: AssertExact<
  MovementResolutionState<Board>,
  MovementResolutionStateSchemaType
> = true;

/** The schema for the state of the movement resolution substep. */
export const movementResolutionStateSchema: z.ZodObject<{
  substepType: z.ZodLiteral<'commandResolution'>;
  commandResolutionType: z.ZodLiteral<'movement'>;
  movingUnit: z.ZodType<UnitWithPlacement<Board>>;
  targetPlacement: z.ZodType<UnitPlacement<Board>>;
  moveCommander: z.ZodType<boolean>;
  commitment: z.ZodType<Commitment>;
  engagementState: z.ZodType<EngagementState<Board> | undefined>;
  completed: z.ZodType<boolean>;
}> = _movementResolutionStateSchemaObject;
