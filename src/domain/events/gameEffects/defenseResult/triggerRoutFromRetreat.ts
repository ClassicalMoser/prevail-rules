import type { PlayerSide } from "@entities";
import type { AssertExact } from "@utils";
import { playerSideSchema } from "@entities";
import { GAME_EFFECT_EVENT_TYPE } from "@events/eventTypeLiterals";
import { z } from "zod";

import {
  MELEE_ATTACK_RESOLUTION_CONTEXT,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from "./attackResolutionContext";

/** The type of the trigger rout from retreat game effect. */
export const TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE = "triggerRoutFromRetreat" as const;

/**
 * When a retreat has **no** legal positions, the rules replace retreat with rout. This effect
 * seeds `routState` on the retreat substep that is already open.
 *
 * **Discriminator `retreatResolutionContext`**: Same two literals as
 * `AttackResolutionContext` (`attackResolutionContext.ts`), but named for semantics—*where the
 * retreat substep lives*—not “attack” in general. Ranged branch has no extra fields (single
 * defender path). Melee branch requires `retreatingPlayer` because two attack-apply sides exist.
 *
 * Procedure `generateTriggerRoutFromRetreatEvent` sets the branch; apply trusts it.
 */
export type TriggerRoutFromRetreatEvent =
  | {
      /** The type of the event. */
      eventType: typeof GAME_EFFECT_EVENT_TYPE;
      /** The type of game effect. */
      effectType: typeof TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE;
      /** Retreat substep lives under ranged attack resolution. */
      retreatResolutionContext: typeof RANGED_ATTACK_RESOLUTION_CONTEXT;
      /** The ordered index of the event in the round, zero-indexed. */
      eventNumber: number;
    }
  | {
      /** The type of the event. */
      eventType: typeof GAME_EFFECT_EVENT_TYPE;
      /** The type of game effect. */
      effectType: typeof TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE;
      /** Retreat substep lives under this player's melee attack-apply. */
      retreatResolutionContext: typeof MELEE_ATTACK_RESOLUTION_CONTEXT;
      /** The player whose retreat has no legal options. */
      retreatingPlayer: PlayerSide;
      /** The ordered index of the event in the round, zero-indexed. */
      eventNumber: number;
    };

const _triggerRoutFromRetreatSharedFieldsSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE>;
}> = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE),
});

const _triggerRoutFromRetreatRangedAttackSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE>;
  retreatResolutionContext: z.ZodLiteral<typeof RANGED_ATTACK_RESOLUTION_CONTEXT>;
  eventNumber: z.ZodNumber;
}> = _triggerRoutFromRetreatSharedFieldsSchemaObject.merge(
  z.object({
    /** Ranged attack resolution path. */
    retreatResolutionContext: z.literal(RANGED_ATTACK_RESOLUTION_CONTEXT),
    /** The ordered index of the event in the round, zero-indexed. */
    eventNumber: z.number(),
  }),
);

const _triggerRoutFromRetreatMeleeSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE>;
  retreatResolutionContext: z.ZodLiteral<typeof MELEE_ATTACK_RESOLUTION_CONTEXT>;
  retreatingPlayer: typeof playerSideSchema;
  eventNumber: z.ZodNumber;
}> = _triggerRoutFromRetreatSharedFieldsSchemaObject.merge(
  z.object({
    /** Melee resolution path. */
    retreatResolutionContext: z.literal(MELEE_ATTACK_RESOLUTION_CONTEXT),
    /** The player whose retreat has no legal options. */
    retreatingPlayer: playerSideSchema,
    /** The ordered index of the event in the round, zero-indexed. */
    eventNumber: z.number(),
  }),
);

/** Branches share `effectType`; nested discrimination uses `retreatResolutionContext`. */
const _triggerRoutFromRetreatEventSchemaObject: z.ZodDiscriminatedUnion<
  [
    typeof _triggerRoutFromRetreatRangedAttackSchemaObject,
    typeof _triggerRoutFromRetreatMeleeSchemaObject,
  ],
  "retreatResolutionContext"
> = z.discriminatedUnion("retreatResolutionContext", [
  _triggerRoutFromRetreatRangedAttackSchemaObject,
  _triggerRoutFromRetreatMeleeSchemaObject,
]);

type TriggerRoutFromRetreatEventSchemaType = z.infer<
  typeof _triggerRoutFromRetreatEventSchemaObject
>;

/** Shared `eventType` / `effectType` for both branches. */
export const triggerRoutFromRetreatSharedFieldsSchema: typeof _triggerRoutFromRetreatSharedFieldsSchemaObject =
  _triggerRoutFromRetreatSharedFieldsSchemaObject;

/** Branch schema: ranged attack resolution. */
export const triggerRoutFromRetreatRangedAttackSchema: typeof _triggerRoutFromRetreatRangedAttackSchemaObject =
  _triggerRoutFromRetreatRangedAttackSchemaObject;

/** Branch schema: melee resolution. */
export const triggerRoutFromRetreatMeleeSchema: typeof _triggerRoutFromRetreatMeleeSchemaObject =
  _triggerRoutFromRetreatMeleeSchemaObject;

/** The schema for a trigger rout from retreat event. */
export const triggerRoutFromRetreatEventSchema: typeof _triggerRoutFromRetreatEventSchemaObject =
  _triggerRoutFromRetreatEventSchemaObject;

const _assertExactTriggerRoutFromRetreatEvent: AssertExact<
  TriggerRoutFromRetreatEvent,
  TriggerRoutFromRetreatEventSchemaType
> = true;
