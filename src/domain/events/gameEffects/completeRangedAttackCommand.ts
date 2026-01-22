import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

export const COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE =
  'completeRangedAttackCommand' as const;

export interface CompleteRangedAttackCommandEvent<
  _TBoard extends Board,
  _TEffectType extends 'completeRangedAttackCommand' =
    'completeRangedAttackCommand',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE;
}

const _completeRangedAttackCommandEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE),
});

type CompleteRangedAttackCommandEventSchemaType = z.infer<
  typeof _completeRangedAttackCommandEventSchemaObject
>;

const _assertExactCompleteRangedAttackCommandEvent: AssertExact<
  CompleteRangedAttackCommandEvent<Board>,
  CompleteRangedAttackCommandEventSchemaType
> = true;

/** The schema for a complete ranged attack command event. */
export const completeRangedAttackCommandEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeRangedAttackCommand'>;
}> = _completeRangedAttackCommandEventSchemaObject;
