import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the complete resolve melee phase game effect. */
export const COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE =
  'completeResolveMeleePhase' as const;

/**
 * Ends Phase 4, Resolve Melee, once no engagement is left to fight (§4.4.2),
 * and begins Phase 5, Cleanup (§4.5).
 *
 * `generateCompleteResolveMeleePhaseEvent` writes it, and `applyCompleteResolveMeleePhaseEvent` applies it.
 */
export interface CompleteResolveMeleePhaseEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE;
}

const _completeResolveMeleePhaseEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE),
  })
  .strict();

type CompleteResolveMeleePhaseEventSchemaType = z.infer<
  typeof _completeResolveMeleePhaseEventSchemaObject
>;

const _assertExactCompleteResolveMeleePhaseEvent: AssertExact<
  CompleteResolveMeleePhaseEvent,
  CompleteResolveMeleePhaseEventSchemaType
> = true;

/** The schema for a complete resolve melee phase event. */
export const completeResolveMeleePhaseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeResolveMeleePhase'>;
}> = _completeResolveMeleePhaseEventSchemaObject;
