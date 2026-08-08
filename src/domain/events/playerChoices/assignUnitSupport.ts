import type { PlayerSide, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitInstanceSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the assign unit support event. */
export const ASSIGN_UNIT_SUPPORT_CHOICE_TYPE = 'assignUnitSupport' as const;

/**
 * One hand card’s support slots assigned to board units (≤ that card’s count).
 */
export interface UnitSupportAssignment {
  /** Hand card id providing the support slots. */
  cardId: string;
  /** Units covered by this card’s support (length ≤ card.unitSupport.count). */
  units: UnitInstance[];
}

/**
 * Player assigns hand support slots to board units after rally.
 * Units not covered lose support and are routed.
 */
export interface AssignUnitSupportEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof ASSIGN_UNIT_SUPPORT_CHOICE_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player assigning support (the rallying player). */
  player: PlayerSide;
  /** Per-card slot assignments (omit unused hand cards). */
  assignments: UnitSupportAssignment[];
}

const unitSupportAssignmentSchemaObject: z.ZodObject<{
  cardId: z.ZodString;
  units: z.ZodArray<typeof unitInstanceSchema>;
}> = z.object({
  cardId: z.string(),
  units: z.array(unitInstanceSchema),
});

const _assignUnitSupportEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(ASSIGN_UNIT_SUPPORT_CHOICE_TYPE),
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: z.number(),
  /** The player assigning support (the rallying player). */
  player: playerSideSchema,
  /** Per-card slot assignments (omit unused hand cards). */
  assignments: z.array(unitSupportAssignmentSchemaObject),
});

type AssignUnitSupportEventSchemaType = z.infer<
  typeof _assignUnitSupportEventSchemaObject
>;

const _assertExactAssignUnitSupportEvent: AssertExact<
  AssignUnitSupportEvent,
  AssignUnitSupportEventSchemaType
> = true;

/** The schema for an assign-unit-support event. */
export const assignUnitSupportEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'assignUnitSupport'>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  assignments: z.ZodArray<typeof unitSupportAssignmentSchemaObject>;
}> = _assignUnitSupportEventSchemaObject;
