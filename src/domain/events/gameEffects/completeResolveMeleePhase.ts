import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the complete resolve melee phase game effect. */
export const COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE =
  'completeResolveMeleePhase' as const;

/** Event to complete the resolve melee phase and advance to cleanup phase. */
export interface CompleteResolveMeleePhaseEvent<
  _TBoard extends Board,
  _TEffectType extends 'completeResolveMeleePhase' =
    'completeResolveMeleePhase',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE;
}

const _completeResolveMeleePhaseEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE),
});

type CompleteResolveMeleePhaseEventSchemaType = z.infer<
  typeof _completeResolveMeleePhaseEventSchemaObject
>;

const _assertExactCompleteResolveMeleePhaseEvent: AssertExact<
  CompleteResolveMeleePhaseEvent<Board>,
  CompleteResolveMeleePhaseEventSchemaType
> = true;

/** The schema for a complete resolve melee phase event. */
export const completeResolveMeleePhaseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeResolveMeleePhase'>;
}> = _completeResolveMeleePhaseEventSchemaObject;
