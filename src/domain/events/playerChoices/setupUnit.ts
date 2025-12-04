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

/** An event to setup a unit on the board. */
export interface SetupUnitEvent {
  /** The type of the event. */
  eventType: 'playerChoice';
  /** The player who is setting up the unit. */
  player: PlayerSide;
  /** The unit to setup. */
  unit: UnitInstance;
  /** The space to setup the unit on. */
  space: BoardCoordinate<Board>;
}

const _setupUnitEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal('playerChoice' as const),
  /** The player who is setting up the unit. */
  player: playerSideSchema,
  /** The unit to setup. */
  unit: unitInstanceSchema,
  /** The space to setup the unit on. */
  space: boardCoordinateSchema,
});

type SetupUnitEventSchemaType = z.infer<typeof _setupUnitEventSchemaObject>;

// Verify manual type matches schema inference
const _assertExactSetupUnitEvent: AssertExact<
  SetupUnitEvent,
  SetupUnitEventSchemaType
> = true;

/** The schema for a setup unit event. */
export const setupUnitEventSchema: z.ZodType<SetupUnitEvent> =
  _setupUnitEventSchemaObject;
