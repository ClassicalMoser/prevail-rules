import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the complete ranged attack command game effect. */
export const COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE =
  'completeRangedAttackCommand' as const;

/**
 * Ends a Shoot order once none of the units it ordered is left to shoot
 * (§4.3.11).
 *
 * `generateCompleteRangedAttackCommandEvent` writes it, and `applyCompleteRangedAttackCommandEvent` applies it.
 */
export interface CompleteRangedAttackCommandEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE;
}

const _completeRangedAttackCommandEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE),
  })
  .strict();

type CompleteRangedAttackCommandEventSchemaType = z.infer<
  typeof _completeRangedAttackCommandEventSchemaObject
>;

const _assertExactCompleteRangedAttackCommandEvent: AssertExact<
  CompleteRangedAttackCommandEvent,
  CompleteRangedAttackCommandEventSchemaType
> = true;

/** The schema for a complete ranged attack command event. */
export const completeRangedAttackCommandEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeRangedAttackCommand'>;
}> = _completeRangedAttackCommandEventSchemaObject;
