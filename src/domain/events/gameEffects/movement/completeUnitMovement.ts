import type { GAME_EFFECT_EVENT_TYPE } from "@events/eventTypeLiterals";
import type { AssertExact } from "@utils";
import { z } from "zod";

/** The type of the complete unit movement game effect. */
export const COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE = "completeUnitMovement" as const;

/** The event for the game resolution of a unit movement. */
export interface CompleteUnitMovementEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

const _completeUnitMovementEventSchemaObject = z.object({
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: z.number(),
  /** The type of the event. */
  eventType: z.literal("gameEffect"),
  /** The type of game effect. */
  effectType: z.literal("completeUnitMovement"),
});

type CompleteUnitMovementEventSchemaType = z.infer<typeof _completeUnitMovementEventSchemaObject>;

const _assertExactCompleteUnitMovementEvent: AssertExact<
  CompleteUnitMovementEvent,
  CompleteUnitMovementEventSchemaType
> = true;

/** The schema for a complete unit movement event. */
export const completeUnitMovementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<"gameEffect">;
  effectType: z.ZodLiteral<"completeUnitMovement">;
  eventNumber: z.ZodNumber;
}> = _completeUnitMovementEventSchemaObject;
