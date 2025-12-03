import type { Board, PlayerSide, UnitInstance, UnitPlacement } from '@entities';
import type { AssertExact } from '@utils';
import {
  playerSideSchema,
  unitInstanceSchema,
  unitPlacementSchema,
} from '@entities';
import { z } from 'zod';

/** The schema for a move unit command. */
export const moveUnitCommandSchema = z.object({
  /** The player who is moving the unit. */
  player: playerSideSchema,
  /** The unit to move. */
  unit: unitInstanceSchema,
  /** The space the unit is currently in. */
  from: unitPlacementSchema,
  /** The space the unit is moving to. */
  to: unitPlacementSchema,
});

// Helper type to check match of type against schema
type MoveUnitCommandSchemaType = z.infer<typeof moveUnitCommandSchema>;

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

// Helper type to check match of type against schema.
const _assertExactMoveUnitCommand: AssertExact<
  MoveUnitCommand,
  MoveUnitCommandSchemaType
> = true;
