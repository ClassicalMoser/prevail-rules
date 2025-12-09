import type { Board, PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitWithPlacementSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { SETUP_UNITS_CHOICE_TYPE } from './playerChoice';

/** An event to setup multiple units on the board. */
export interface SetupUnitsEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof SETUP_UNITS_CHOICE_TYPE;
  /** The player who is setting up the units. */
  player: PlayerSide;
  /** The units to setup, each with its placement. */
  unitPlacements: Set<UnitWithPlacement<Board>>;
}

const _setupUnitsEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(SETUP_UNITS_CHOICE_TYPE),
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
export const setupUnitsEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof SETUP_UNITS_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  unitPlacements: z.ZodSet<typeof unitWithPlacementSchema>;
}> = _setupUnitsEventSchemaObject;
