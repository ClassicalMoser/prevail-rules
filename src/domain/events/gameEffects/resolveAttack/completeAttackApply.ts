import type { AttackType, Board, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { attackTypeSchema, playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the complete attack apply game effect. */
export const COMPLETE_ATTACK_APPLY_EFFECT_TYPE = 'completeAttackApply' as const;

/**
 * Closes the attack-apply substep and advances sequencing (routed / reverse / retreat / etc.).
 *
 * **Why `attackType` + `defendingPlayer` on the event**: Melee has two parallel attack-apply
 * states (one per side). Apply must know which subtree to clear without inferring from board or
 * initiative; the procedure encodes that explicitly.
 */
export interface CompleteAttackApplyEvent<
  _TBoard extends Board,
  _TEffectType extends 'completeAttackApply' = 'completeAttackApply',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_ATTACK_APPLY_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The type of attack. */
  attackType: AttackType;
  /** The defending player whose unit was attacked. */
  defendingPlayer: PlayerSide;
}

const _completeAttackApplyEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof COMPLETE_ATTACK_APPLY_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  attackType: typeof attackTypeSchema;
  defendingPlayer: typeof playerSideSchema;
}> = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(COMPLETE_ATTACK_APPLY_EFFECT_TYPE),
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: z.number(),
  /** Mirrors {@link CompleteAttackApplyEvent.attackType}. */
  attackType: attackTypeSchema,
  /** Mirrors {@link CompleteAttackApplyEvent.defendingPlayer}. */
  defendingPlayer: playerSideSchema,
});

type CompleteAttackApplyEventSchemaType = z.infer<
  typeof _completeAttackApplyEventSchemaObject
>;

/** The schema for a complete attack apply event. */
export const completeAttackApplyEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof COMPLETE_ATTACK_APPLY_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  attackType: typeof attackTypeSchema;
  defendingPlayer: typeof playerSideSchema;
}> = _completeAttackApplyEventSchemaObject;

const _assertExactCompleteAttackApplyEvent: AssertExact<
  CompleteAttackApplyEvent<Board>,
  CompleteAttackApplyEventSchemaType
> = true;
