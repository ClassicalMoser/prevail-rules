import type { UnitFacing, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { unitFacingSchema, unitInstanceSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve reverse game effect. */
export const RESOLVE_REVERSE_EFFECT_TYPE = 'resolveReverse' as const;

/**
 * Turns a reversed unit about (§9.2). The event names the unit, and its owner names the
 * reverse: which attack's apply holds it is the state's to say.
 */
export interface ResolveReverseEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_REVERSE_EFFECT_TYPE;
  /** The unit being reversed, by identity; where it stands is the board's. */
  unit: UnitInstance;
  /**
   * The way it faces once the reverse is resolved: turned about, or unchanged
   * when it is still locked with an opponent (§7.5.5).
   */
  facing: UnitFacing;
}

const _resolveReverseEventSchemaObject = z
  .object({
    effectType: z.literal(RESOLVE_REVERSE_EFFECT_TYPE),
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    facing: unitFacingSchema,
    unit: unitInstanceSchema,
  })
  .strict();

type ResolveReverseEventSchemaType = z.infer<
  typeof _resolveReverseEventSchemaObject
>;

const _assertExactResolveReverseEvent: AssertExact<
  ResolveReverseEvent,
  ResolveReverseEventSchemaType
> = true;

/** The schema for a resolve reverse event. */
export const resolveReverseEventSchema: z.ZodObject<{
  effectType: z.ZodLiteral<typeof RESOLVE_REVERSE_EFFECT_TYPE>;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  facing: typeof unitFacingSchema;
  unit: typeof unitInstanceSchema;
}> = _resolveReverseEventSchemaObject;
