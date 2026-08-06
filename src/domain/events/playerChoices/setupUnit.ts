import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitWithPlacementSchema } from '@entities';
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
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is setting up the units. */
  player: PlayerSide;
}

const _setupUnitsEventSchemaObject = z.object({
  choiceType: z.literal(SETUP_UNITS_CHOICE_TYPE),
  eventNumber: z.number(),
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  player: playerSideSchema,
  unitPlacements: z.array(unitWithPlacementSchema),
});

type SetupUnitsEventSchemaType = z.infer<typeof _setupUnitsEventSchemaObject>;

const _assertExactSetupUnitsEvent: AssertExact<
  SetupUnitsEvent,
  SetupUnitsEventSchemaType
> = true;

/** The schema for a setup units event. */
export const setupUnitsEventSchema: z.ZodObject<{
  choiceType: z.ZodLiteral<typeof SETUP_UNITS_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  player: typeof playerSideSchema;
  unitPlacements: z.ZodArray<typeof unitWithPlacementSchema>;
}> = _setupUnitsEventSchemaObject;
