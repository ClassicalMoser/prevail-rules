import type { Board, PlayerSide, UnitInstance, UnitPlacement } from '@entities';
import type { AssertExact } from '@utils';
import {
  playerSideSchema,
  unitInstanceSchema,
  unitPlacementSchema,
} from '@entities';
import { z } from 'zod';

/** A command to move a unit from one space to another. */
export interface MoveUnitCommand {
  /** The player who is moving the unit. */
  player: PlayerSide;
  /** The unit to move. */
  unit: UnitInstance;
  /** The space the unit is currently in. */
  from: UnitPlacement<Board>;
  /** The space the unit is moving to. */
  to: UnitPlacement<Board>;
}

const _moveUnitCommandSchemaObject = z.object({
  /** The player who is moving the unit. */
  player: playerSideSchema,
  /** The unit to move. */
  unit: unitInstanceSchema,
  /** The space the unit is currently in. */
  from: unitPlacementSchema,
  /** The space the unit is moving to. */
  to: unitPlacementSchema,
});

type MoveUnitCommandSchemaType = z.infer<typeof _moveUnitCommandSchemaObject>;

/** The schema for a move unit command. */
export const moveUnitCommandSchema: z.ZodType<MoveUnitCommand> =
  _moveUnitCommandSchemaObject;

// Verify manual type matches schema inference
const _assertExactMoveUnitCommand: AssertExact<
  MoveUnitCommand,
  MoveUnitCommandSchemaType
> = true;
