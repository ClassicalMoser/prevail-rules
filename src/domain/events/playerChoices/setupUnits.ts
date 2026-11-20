import type { Coordinate, PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import {
  coordinateSchema,
  playerSideSchema,
  unitWithPlacementSchema,
} from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the setup units player choice. */
export const SETUP_UNITS_CHOICE_TYPE = 'setupUnits' as const;

/**
 * A player deploys their whole army at once, before the first round: every
 * unit in its own zone (§3.5.1), and the general with them (§3.5.3).
 *
 * `getLegalSetupUnits` enumerates the legal options, and
 * `applySetupUnitsEvent` applies the choice.
 */
export interface SetupUnitsEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof SETUP_UNITS_CHOICE_TYPE;
  /** The player deploying. */
  player: PlayerSide;
  /** The units deployed, each with its space and facing (§3.5.1). */
  unitPlacements: UnitWithPlacement[];
  /**
   * Where this player's commander starts: a space in the player's zone with
   * no unit on it before this event. It may share that space with a unit
   * placed in this same event (§3.5.3).
   */
  commanderCoordinate: Coordinate;
}

const _setupUnitsEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(SETUP_UNITS_CHOICE_TYPE),
    /** The player deploying. */
    player: playerSideSchema,
    /** Where this player's commander starts (§3.5.3). */
    commanderCoordinate: coordinateSchema,
    /** The units deployed, each with its space and facing (§3.5.1). */
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
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof SETUP_UNITS_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  commanderCoordinate: typeof coordinateSchema;
  unitPlacements: z.ZodArray<typeof unitWithPlacementSchema>;
}> = _setupUnitsEventSchemaObject;
