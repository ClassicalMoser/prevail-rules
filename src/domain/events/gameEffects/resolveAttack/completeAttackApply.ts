import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the complete attack apply game effect. */
export const COMPLETE_ATTACK_APPLY_EFFECT_TYPE = 'completeAttackApply' as const;

/**
 * An attack's results have all been carried out, each stage it reached:
 * retreat, reverse and rout (§7.5.2). This closes them.
 *
 * Closes the attack-apply substep and advances sequencing (routed / reverse / retreat / etc.).
 * It carries nothing: which apply closes is the state's to name. A shot has one, and a melee's
 * two close in the order their attacks take effect (§7.5.6).
 *
 * `generateCompleteAttackApplyEvent` writes it, and `applyCompleteAttackApplyEvent` applies it.
 */
export interface CompleteAttackApplyEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof COMPLETE_ATTACK_APPLY_EFFECT_TYPE;
}

const _completeAttackApplyEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
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
