import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the complete attack apply game effect. */
export const COMPLETE_ATTACK_APPLY_EFFECT_TYPE = 'completeAttackApply' as const;

/**
 * Closes the attack-apply substep and advances sequencing (routed / reverse / retreat / etc.).
 * It carries nothing: which apply closes is the state's to name. A shot has one, and a melee's
 * two close in the order their attacks take effect (§7.5.6).
 */
export interface CompleteAttackApplyEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_ATTACK_APPLY_EFFECT_TYPE;
}

const _completeAttackApplyEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(COMPLETE_ATTACK_APPLY_EFFECT_TYPE),
  })
  .strict();

type CompleteAttackApplyEventSchemaType = z.infer<
  typeof _completeAttackApplyEventSchemaObject
>;

/** The schema for a complete attack apply event. */
export const completeAttackApplyEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeAttackApply'>;
}> = _completeAttackApplyEventSchemaObject;

const _assertExactCompleteAttackApplyEvent: AssertExact<
  CompleteAttackApplyEvent,
  CompleteAttackApplyEventSchemaType
> = true;
