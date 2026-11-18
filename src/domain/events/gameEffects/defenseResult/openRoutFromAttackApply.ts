import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the open rout from attack apply game effect. */
export const OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE =
  'openRoutFromAttackApply' as const;

/**
 * An attack's results are carried out a stage at a time: retreat, then
 * reverse, then rout (§7.5.2). This opens the rout when its turn comes, and
 * the routed unit leaves the board (§9.3.1).
 *
 * Opens the rout substep on an attack apply whose rout slot is still
 * `'pending'`. The attack already measured a rout; this event writes the
 * substep when that step's turn comes. It carries nothing: which apply opens
 * is the state's to name (`getAttackApplyAwaitingOpen`).
 *
 * `generateOpenRoutFromAttackApplyEvent` writes it, and `applyOpenRoutFromAttackApplyEvent` applies it.
 */
export interface OpenRoutFromAttackApplyEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE;
}

const _openRoutFromAttackApplyEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
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
