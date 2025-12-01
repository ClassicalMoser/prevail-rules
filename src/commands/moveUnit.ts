import type { Board } from "src/entities/board/board.js";
import type { UnitInstance } from "src/entities/unit/unitInstance.js";
import type { UnitPlacement } from "src/entities/unitLocation/unitPlacement.js";
import type { AssertExact } from "src/utils/assertExact.js";
import type { PlayerSide } from "../entities/player/playerSide.js";
import { unitInstanceSchema } from "src/entities/unit/unitInstance.js";
import { unitPlacementSchema } from "src/entities/unitLocation/unitPlacement.js";
import { z } from "zod";
import { playerSideSchema } from "../entities/player/playerSide.js";

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
