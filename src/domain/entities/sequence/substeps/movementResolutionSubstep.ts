import type { Board } from '@entities/board';
import type { UnitPlacement, UnitWithPlacement } from '@entities/unitLocation';
import type { AssertExact } from '@utils';
import type { Commitment } from '../commitment';
import {
  unitPlacementSchema,
  unitWithPlacementSchema,
} from '@entities/unitLocation';
import { z } from 'zod';
import { commitmentSchema } from '../commitment';

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
}> = _movementResolutionStateSchemaObject;
