import type { Board, PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitWithPlacementSchema } from '@entities';
import { z } from 'zod';

/** An event to setup multiple units on the board. */
export interface SetupUnitsEvent {
  /** The type of the event. */
  eventType: 'playerChoice';
  /** The player who is setting up the units. */
  player: PlayerSide;
  /** The units to setup, each with its placement. */
  unitPlacements: Set<UnitWithPlacement<Board>>;
}

const _setupUnitsEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal('playerChoice' as const),
  /** The player who is setting up the units. */
  player: playerSideSchema,
  /** The units to setup, each with its placement. */
  unitPlacements: z.set(unitWithPlacementSchema),
});

type SetupUnitsEventSchemaType = z.infer<typeof _setupUnitsEventSchemaObject>;

// Verify manual type matches schema inference
const _assertExactSetupUnitsEvent: AssertExact<
  SetupUnitsEvent,
  SetupUnitsEventSchemaType
> = true;

/** The schema for a setup units event. */
export const setupUnitsEventSchema: z.ZodType<SetupUnitsEvent> =
  _setupUnitsEventSchemaObject;
