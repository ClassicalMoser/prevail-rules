import type {
  Board,
  BoardCoordinate,
  PlayerSide,
  UnitInstance,
} from '@entities';
import type { AssertExact } from '@utils';
import {
  boardCoordinateSchema,
  playerSideSchema,
  unitInstanceSchema,
} from '@entities';
import { z } from 'zod';

/** A command to setup a unit on the board. */
export interface SetupUnitCommand {
  /** The player who is setting up the unit. */
  player: PlayerSide;
  /** The unit to setup. */
  unit: UnitInstance;
  /** The space to setup the unit on. */
  space: BoardCoordinate<Board>;
}

const _setupUnitCommandSchemaObject = z.object({
  /** The player who is setting up the unit. */
  player: playerSideSchema,
  /** The unit to setup. */
  unit: unitInstanceSchema,
  /** The space to setup the unit on. */
  space: boardCoordinateSchema,
});

type SetupUnitCommandSchemaType = z.infer<typeof _setupUnitCommandSchemaObject>;

/** The schema for a setup unit command. */
export const setupUnitCommandSchema: z.ZodType<SetupUnitCommand> =
  _setupUnitCommandSchemaObject;

// Verify manual type matches schema inference
const _assertExactSetupUnitCommand: AssertExact<
  SetupUnitCommand,
  SetupUnitCommandSchemaType
> = true;
