import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the complete melee resolution game effect. */
export const COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE =
  'completeMeleeResolution' as const;

/**
 * One melee has been fought out and its results carried out (§7.5); the
 * first player then names the next, until none remain (§4.4.2).
 *
 * `generateCompleteMeleeResolutionEvent` writes it, and `applyCompleteMeleeResolutionEvent` applies it.
 */
export interface CompleteMeleeResolutionEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE;
}

const _completeMeleeResolutionEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE),
  })
  .strict();

type CompleteMeleeResolutionEventSchemaType = z.infer<
  typeof _completeMeleeResolutionEventSchemaObject
>;

const _assertExactCompleteMeleeResolutionEvent: AssertExact<
  CompleteMeleeResolutionEvent,
  CompleteMeleeResolutionEventSchemaType
> = true;

/** The schema for a complete melee resolution event. */
export const completeMeleeResolutionEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeMeleeResolution'>;
}> = _completeMeleeResolutionEventSchemaObject;
