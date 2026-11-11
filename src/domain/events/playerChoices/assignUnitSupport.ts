import type { PlayerSide, UnitInstance, UnitSupport } from '@entities';
import type { AssertExact } from '@utils';
import {
  playerSideSchema,
  unitInstanceSchema,
  unitSupportSchema,
} from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the assign unit support event. */
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
 * Player assigns hand support to board units after rally.
 * Assignment must be locally maximal (use every slot that can still cover
 * someone uncovered); global allocation optimality is not required.
 * Units left uncovered lose support and are routed.
 *
 * The assignments are a set: the order they are listed in does not matter.
 */
export interface AssignUnitSupportEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
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
    unitSupport: unitSupportSchema,
    unit: unitInstanceSchema,
  })
  .strict();

const _assignUnitSupportEventSchemaObject = z
  .object({
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    choiceType: z.literal(ASSIGN_UNIT_SUPPORT_CHOICE_TYPE),
    player: playerSideSchema,
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

export const assignUnitSupportEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'assignUnitSupport'>;
  player: typeof playerSideSchema;
  assignments: z.ZodArray<typeof unitSupportAssignmentSchemaObject>;
}> = _assignUnitSupportEventSchemaObject;
