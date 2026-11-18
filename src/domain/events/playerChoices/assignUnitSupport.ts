import type { PlayerSide, UnitInstance, UnitSupport } from '@entities';
import type { AssertExact } from '@utils';
import {
  playerSideSchema,
  unitInstanceSchema,
  unitSupportSchema,
} from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the assign unit support player choice. */
export const ASSIGN_UNIT_SUPPORT_CHOICE_TYPE = 'assignUnitSupport' as const;

/**
 * One unit taking one place under one unit support the hand's cards sum to
 * (§10.4.3–10.4.4).
 */
export interface UnitSupportAssignment {
  /** The unit support, as the hand sums it; echoed from the legal options. */
  unitSupport: UnitSupport;
  /** The unit taking a place under it. */
  unit: UnitInstance;
}

/**
 * After a rally, the player who rallied gives each of their units on the
 * board a place under the unit support their hand holds (§10.4.4). An open
 * place that an uncovered unit could fill must be filled, but the best
 * arrangement is not required (§10.4.5). Units left without a place rout
 * together (§10.4.6).
 *
 * The assignments are a set: the order they are listed in does not matter.
 *
 * `getLegalAssignUnitSupport` enumerates the legal options, and
 * `applyAssignUnitSupportEvent` applies the choice.
 */
export interface AssignUnitSupportEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof ASSIGN_UNIT_SUPPORT_CHOICE_TYPE;
  /** The player who rallied and is now placing their units under the hand's cards. */
  player: PlayerSide;
  /** One entry per unit given a place, in any order. */
  assignments: UnitSupportAssignment[];
}

const unitSupportAssignmentSchemaObject: z.ZodObject<{
  unitSupport: typeof unitSupportSchema;
  unit: typeof unitInstanceSchema;
}> = z
  .object({
    /** The unit support, as the hand sums it; echoed from the legal options. */
    unitSupport: unitSupportSchema,
    /** The unit taking a place under it. */
    unit: unitInstanceSchema,
  })
  .strict();

const _assignUnitSupportEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(ASSIGN_UNIT_SUPPORT_CHOICE_TYPE),
    /** The player who rallied and is now placing their units under the hand's cards. */
    player: playerSideSchema,
    /** One entry per unit given a place, in any order. */
    assignments: z.array(unitSupportAssignmentSchemaObject),
  })
  .strict();

type AssignUnitSupportEventSchemaType = z.infer<
  typeof _assignUnitSupportEventSchemaObject
>;

const _assertExactAssignUnitSupportEvent: AssertExact<
  AssignUnitSupportEvent,
  AssignUnitSupportEventSchemaType
> = true;

/** The schema for an assign unit support event. */
export const assignUnitSupportEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'assignUnitSupport'>;
  player: typeof playerSideSchema;
  assignments: z.ZodArray<typeof unitSupportAssignmentSchemaObject>;
}> = _assignUnitSupportEventSchemaObject;
