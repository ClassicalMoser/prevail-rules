/**
 * Resolve-rout effect: remove routed units and drive discard / rout substep state.
 *
 * **Why `routResolutionSource`**: Rout can start from ranged attack apply, melee attack apply,
 * cleanup rally, or rear engagement during movement. Apply must clear the correct `routState`
 * bucket; the procedure encodes which branch is active. The first two literals reuse
 * `attackResolutionContext.ts`; the rest are rout-specific (see non-attack constants below).
 *
 * Tuple-typed value arrays satisfy `--isolatedDeclarations` (no spread-composed exports).
 */
import type { UnitInstance } from "@entities";
import type { AssertExact } from "@utils";
import type { AttackResolutionContext } from "./attackResolutionContext";
import { unitInstanceSchema } from "@entities";
import { GAME_EFFECT_EVENT_TYPE } from "@events/eventTypeLiterals";

import { z } from "zod";
import {
  attackResolutionContextSchema,
  MELEE_ATTACK_RESOLUTION_CONTEXT,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from "./attackResolutionContext";

/** The type of the resolve rout game effect. */
export const RESOLVE_ROUT_EFFECT_TYPE = "resolveRout" as const;

/** Rout originating from cleanup rally resolution, not attack apply. */
export const RALLY_ROUT_RESOLUTION_SOURCE = "rally" as const;

/** Rout originating from rear engagement during unit movement resolution. */
export const REAR_ENGAGEMENT_MOVEMENT_ROUT_SOURCE = "rearEngagementMovement" as const;

export type RoutResolutionSourceNonAttack =
  | typeof RALLY_ROUT_RESOLUTION_SOURCE
  | typeof REAR_ENGAGEMENT_MOVEMENT_ROUT_SOURCE;

/** Values for `z.enum` on the non-attack branch only. */
export const ROUT_RESOLUTION_SOURCE_NON_ATTACK_VALUES: readonly [
  typeof RALLY_ROUT_RESOLUTION_SOURCE,
  typeof REAR_ENGAGEMENT_MOVEMENT_ROUT_SOURCE,
] = [RALLY_ROUT_RESOLUTION_SOURCE, REAR_ENGAGEMENT_MOVEMENT_ROUT_SOURCE];

/** Attack-apply paths plus rally / rear-engagement movement. */
export type RoutResolutionSource = AttackResolutionContext | RoutResolutionSourceNonAttack;

/**
 * All rout sources in declaration order (matches `z.union` composition: attack enum ∪ non-attack
 * enum).
 */
export const ROUT_RESOLUTION_SOURCE_VALUES: readonly [
  typeof RANGED_ATTACK_RESOLUTION_CONTEXT,
  typeof MELEE_ATTACK_RESOLUTION_CONTEXT,
  typeof RALLY_ROUT_RESOLUTION_SOURCE,
  typeof REAR_ENGAGEMENT_MOVEMENT_ROUT_SOURCE,
] = [
  RANGED_ATTACK_RESOLUTION_CONTEXT,
  MELEE_ATTACK_RESOLUTION_CONTEXT,
  RALLY_ROUT_RESOLUTION_SOURCE,
  REAR_ENGAGEMENT_MOVEMENT_ROUT_SOURCE,
];

const _routResolutionSourceNonAttackSchemaObject: z.ZodType<RoutResolutionSourceNonAttack> = z.enum(
  ROUT_RESOLUTION_SOURCE_NON_ATTACK_VALUES,
);

// Union (not a flat four-way enum) keeps `attackResolutionContext` as the single shared schema.
const _routResolutionSourceSchemaObject: z.ZodType<RoutResolutionSource> = z.union([
  attackResolutionContextSchema,
  _routResolutionSourceNonAttackSchemaObject,
]);

export const routResolutionSourceSchema: typeof _routResolutionSourceSchemaObject =
  _routResolutionSourceSchemaObject;

/**
 * Applies rout resolution: units leave the game and the owning player pays discard penalty.
 *
 * `routResolutionSource` is procedure-filled so apply can `switch` without scanning the board.
 */
export interface ResolveRoutEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_ROUT_EFFECT_TYPE;
  /** Which part of state owns the in-progress rout substep. */
  routResolutionSource: RoutResolutionSource;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The unit instances that are being routed. */
  unitInstances: Set<UnitInstance>;
  /** The penalty for routing the units (sum of all units' rout penalties). */
  penalty: number;
}

const _resolveRoutEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_ROUT_EFFECT_TYPE),
  /** Which part of state owns the in-progress rout substep. */
  routResolutionSource: routResolutionSourceSchema,
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: z.number(),
  /** The unit instances that are being routed. */
  unitInstances: z.set(unitInstanceSchema),
  /** The penalty for routing the units (sum of all units' rout penalties). */
  penalty: z.number(),
});

type ResolveRoutEventSchemaType = z.infer<typeof _resolveRoutEventSchemaObject>;

const _assertExactResolveRoutEvent: AssertExact<ResolveRoutEvent, ResolveRoutEventSchemaType> =
  true;

/** The schema for a resolve rout event. */
export const resolveRoutEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<"gameEffect">;
  effectType: z.ZodLiteral<"resolveRout">;
  routResolutionSource: typeof routResolutionSourceSchema;
  eventNumber: z.ZodNumber;
  unitInstances: z.ZodSet<typeof unitInstanceSchema>;
  penalty: z.ZodNumber;
}> = _resolveRoutEventSchemaObject;
