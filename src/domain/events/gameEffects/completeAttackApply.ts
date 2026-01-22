import type { Board } from '@entities';
import type { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import type { AssertExact } from '@utils';
import { z } from 'zod';

/** The type of the complete attack apply game effect. */
export const COMPLETE_ATTACK_APPLY_EFFECT_TYPE = 'completeAttackApply' as const;

/** The event for completing an attack apply substep. */
export interface CompleteAttackApplyEvent<
  _TBoard extends Board,
  _TEffectType extends 'completeAttackApply' = 'completeAttackApply',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_ATTACK_APPLY_EFFECT_TYPE;
}

const _completeAttackApplyEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal('gameEffect'),
  /** The type of game effect. */
  effectType: z.literal('completeAttackApply'),
});

type CompleteAttackApplyEventSchemaType = z.infer<
  typeof _completeAttackApplyEventSchemaObject
>;

const _assertExactCompleteAttackApplyEvent: AssertExact<
  CompleteAttackApplyEvent<Board>,
  CompleteAttackApplyEventSchemaType
> = true;

/** The schema for a complete attack apply event. */
export const completeAttackApplyEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeAttackApply'>;
}> = _completeAttackApplyEventSchemaObject;
