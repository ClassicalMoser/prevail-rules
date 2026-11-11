import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the openRoutFromAttackApply game effect. */
export const OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE =
  'openRoutFromAttackApply' as const;

/**
 * Opens the rout substep on an attack apply whose rout slot is still
 * `'pending'`. The attack already measured a rout; this event writes the
 * substep when that step's turn comes. It carries nothing: which apply opens
 * is the state's to name (`getAttackApplyAwaitingOpen`).
 */
export interface OpenRoutFromAttackApplyEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE;
}

const _openRoutFromAttackApplyEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE),
  })
  .strict();

type OpenRoutFromAttackApplyEventSchemaType = z.infer<
  typeof _openRoutFromAttackApplyEventSchemaObject
>;

const _assertExactOpenRoutFromAttackApplyEvent: AssertExact<
  OpenRoutFromAttackApplyEvent,
  OpenRoutFromAttackApplyEventSchemaType
> = true;

/** The schema for an openRoutFromAttackApply event. */
export const openRoutFromAttackApplyEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'openRoutFromAttackApply'>;
}> = _openRoutFromAttackApplyEventSchemaObject;
