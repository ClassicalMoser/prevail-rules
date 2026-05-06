import type { PlayerSide } from "@entities";
import type { AssertExact } from "@utils";
import { playerSideSchema } from "@entities";
import { GAME_EFFECT_EVENT_TYPE } from "@events/eventTypeLiterals";
import { z } from "zod";

/** The type of the resolve initiative game effect. */
export const RESOLVE_INITIATIVE_EFFECT_TYPE = "resolveInitiative" as const;

/** The event to resolve the initiative.
 * Which player has initiative for the round.
 * The player with the lower initiative value receives initiative.
 * In a tie, the player with initiative keeps it.
 */
export interface ResolveInitiativeEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_INITIATIVE_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player with initiative. */
  player: PlayerSide;
}

const _resolveInitiativeEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_INITIATIVE_EFFECT_TYPE),
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: z.number(),
  /** The player with initiative. */
  player: playerSideSchema,
});

type ResolveInitiativeEventSchemaType = z.infer<typeof _resolveInitiativeEventSchemaObject>;

const _assertExactResolveInitiativeEvent: AssertExact<
  ResolveInitiativeEvent,
  ResolveInitiativeEventSchemaType
> = true;

/** The schema for a resolve initiative event. */
export const resolveInitiativeEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<"gameEffect">;
  effectType: z.ZodLiteral<"resolveInitiative">;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
}> = _resolveInitiativeEventSchemaObject;
