import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the complete ranged attack game effect. */
export const COMPLETE_RANGED_ATTACK_EFFECT_TYPE =
  'completeRangedAttack' as const;

/**
 * One shot of a Shoot order is done (§4.3.11): the shooter's turn ends and the
 * next shooter may be chosen. Which units may still shoot is decided when the
 * next shooter is chosen, not here, so a unit with no target now keeps its
 * place in the order. When no shooter is left, the player's orders end.
 */
export interface CompleteRangedAttackEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_RANGED_ATTACK_EFFECT_TYPE;
}

const _completeRangedAttackEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(COMPLETE_RANGED_ATTACK_EFFECT_TYPE),
  })
  .strict();

type CompleteRangedAttackEventSchemaType = z.infer<
  typeof _completeRangedAttackEventSchemaObject
>;

const _assertExactCompleteRangedAttackEvent: AssertExact<
  CompleteRangedAttackEvent,
  CompleteRangedAttackEventSchemaType
> = true;

/** The schema for a complete ranged attack event. */
export const completeRangedAttackEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeRangedAttack'>;
}> = _completeRangedAttackEventSchemaObject;
