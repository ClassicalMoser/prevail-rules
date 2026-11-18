import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the open reverse from attack apply game effect. */
export const OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE =
  'openReverseFromAttackApply' as const;

/**
 * An attack's results are carried out a stage at a time: retreat, then
 * reverse, then rout (§7.5.2). This opens the reverse when its turn comes.
 *
 * Opens the reverse substep on an attack apply whose reverse slot is still
 * `'pending'`. The attack already measured a reverse; this event writes the
 * substep when that step's turn comes (after any retreat has moved the unit).
 * It carries nothing: which apply opens is the state's to name
 * (`getAttackApplyAwaitingOpen`).
 *
 * `generateOpenReverseFromAttackApplyEvent` writes it, and `applyOpenReverseFromAttackApplyEvent` applies it.
 */
export interface OpenReverseFromAttackApplyEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE;
}

const _openReverseFromAttackApplyEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
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
