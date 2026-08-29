import type { Coordinate, PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import {
  coordinateSchema,
  playerSideSchema,
  unitWithPlacementSchema,
} from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the setup units event. */
export const SETUP_UNITS_CHOICE_TYPE = 'setupUnits' as const;

export interface SetupUnitsEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof SETUP_UNITS_CHOICE_TYPE;
  /** The units to setup, each with its placement. */
  unitPlacements: UnitWithPlacement[];
  /**
   * Where this player's commander starts. Must be an empty coordinate in the
   * player's setup zone (may be alone or stacked with a unit placed in this event).
   */
  commanderCoordinate: Coordinate;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is setting up the units. */
  player: PlayerSide;
}

const _setupUnitsEventSchemaObject = z
  .object({
    choiceType: z.literal(SETUP_UNITS_CHOICE_TYPE),
    commanderCoordinate: coordinateSchema,
    eventNumber: z.number(),
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    player: playerSideSchema,
    unitPlacements: z.array(unitWithPlacementSchema),
  })
  .strict();

type SetupUnitsEventSchemaType = z.infer<typeof _setupUnitsEventSchemaObject>;

const _assertExactSetupUnitsEvent: AssertExact<
  SetupUnitsEvent,
  SetupUnitsEventSchemaType
> = true;

/** The schema for a setup units event. */
export const setupUnitsEventSchema: z.ZodObject<{
  choiceType: z.ZodLiteral<typeof SETUP_UNITS_CHOICE_TYPE>;
  commanderCoordinate: typeof coordinateSchema;
  eventNumber: z.ZodNumber;
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  player: typeof playerSideSchema;
  unitPlacements: z.ZodArray<typeof unitWithPlacementSchema>;
}> = _setupUnitsEventSchemaObject;
