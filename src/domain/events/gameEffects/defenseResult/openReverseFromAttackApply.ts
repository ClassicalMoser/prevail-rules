import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the openReverseFromAttackApply game effect. */
export const OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE =
  'openReverseFromAttackApply' as const;

/**
 * Opens the reverse substep on an attack apply whose reverse slot is still
 * `'pending'`. The attack already measured a reverse; this event writes the
 * substep when that step's turn comes (after any retreat has moved the unit).
 * It carries nothing: which apply opens is the state's to name
 * (`getAttackApplyAwaitingOpen`).
 */
export interface OpenReverseFromAttackApplyEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE;
}

const _openReverseFromAttackApplyEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE),
  })
  .strict();

type OpenReverseFromAttackApplyEventSchemaType = z.infer<
  typeof _openReverseFromAttackApplyEventSchemaObject
>;

const _assertExactOpenReverseFromAttackApplyEvent: AssertExact<
  OpenReverseFromAttackApplyEvent,
  OpenReverseFromAttackApplyEventSchemaType
> = true;

/** The schema for an openReverseFromAttackApply event. */
export const openReverseFromAttackApplyEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'openReverseFromAttackApply'>;
}> = _openReverseFromAttackApplyEventSchemaObject;
