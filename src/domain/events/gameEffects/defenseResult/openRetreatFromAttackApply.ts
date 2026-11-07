import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

import {
  MELEE_ATTACK_RESOLUTION_CONTEXT,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from './attackResolutionContext';

/** The type of the open-retreat-from-attack-apply game effect. */
export const OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE =
  'openRetreatFromAttackApply' as const;

/**
 * Opens the retreat substep on an attack apply whose retreat slot is still
 * `'pending'`. The attack already measured a retreat; this event writes the
 * substep (and its legal options) when that step's turn comes.
 *
 * Procedure sets the branch; apply trusts it and computes legal retreats.
 */
export type OpenRetreatFromAttackApplyEvent =
  | {
      /** The type of the event. */
      eventType: typeof GAME_EFFECT_EVENT_TYPE;
      /** The type of game effect. */
      effectType: typeof OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE;
      /** The apply lives under ranged attack resolution. */
      attackResolutionContext: typeof RANGED_ATTACK_RESOLUTION_CONTEXT;
      /** The ordered index of the event in the round, zero-indexed. */
      eventNumber: number;
    }
  | {
      /** The type of the event. */
      eventType: typeof GAME_EFFECT_EVENT_TYPE;
      /** The type of game effect. */
      effectType: typeof OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE;
      /** The apply lives under this player's melee attack-apply. */
      attackResolutionContext: typeof MELEE_ATTACK_RESOLUTION_CONTEXT;
      /** The defending player whose apply still has a pending retreat. */
      defendingPlayer: PlayerSide;
      /** The ordered index of the event in the round, zero-indexed. */
      eventNumber: number;
    };

const _openRetreatFromAttackApplySharedFieldsSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE>;
}> = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE),
  })
  .strict();

const _openRetreatFromAttackApplyRangedAttackSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE>;
  attackResolutionContext: z.ZodLiteral<
    typeof RANGED_ATTACK_RESOLUTION_CONTEXT
  >;
  eventNumber: z.ZodNumber;
}> = _openRetreatFromAttackApplySharedFieldsSchemaObject.merge(
  z
    .object({
      /** Ranged attack resolution path. */
      attackResolutionContext: z.literal(RANGED_ATTACK_RESOLUTION_CONTEXT),
      /** The ordered index of the event in the round, zero-indexed. */
      eventNumber: z.number(),
    })
    .strict(),
);

const _openRetreatFromAttackApplyMeleeSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE>;
  attackResolutionContext: z.ZodLiteral<typeof MELEE_ATTACK_RESOLUTION_CONTEXT>;
  defendingPlayer: typeof playerSideSchema;
  eventNumber: z.ZodNumber;
}> = _openRetreatFromAttackApplySharedFieldsSchemaObject.merge(
  z
    .object({
      /** Melee resolution path. */
      attackResolutionContext: z.literal(MELEE_ATTACK_RESOLUTION_CONTEXT),
      /** The defending player whose apply still has a pending retreat. */
      defendingPlayer: playerSideSchema,
      /** The ordered index of the event in the round, zero-indexed. */
      eventNumber: z.number(),
    })
    .strict(),
);

/** Branches share `effectType`; nested discrimination uses `attackResolutionContext`. */
const _openRetreatFromAttackApplyEventSchemaObject: z.ZodDiscriminatedUnion<
  [
    typeof _openRetreatFromAttackApplyRangedAttackSchemaObject,
    typeof _openRetreatFromAttackApplyMeleeSchemaObject,
  ],
  'attackResolutionContext'
> = z.discriminatedUnion('attackResolutionContext', [
  _openRetreatFromAttackApplyRangedAttackSchemaObject,
  _openRetreatFromAttackApplyMeleeSchemaObject,
]);

type OpenRetreatFromAttackApplyEventSchemaType = z.infer<
  typeof _openRetreatFromAttackApplyEventSchemaObject
>;

/** The schema for an open-retreat-from-attack-apply event. */
export const openRetreatFromAttackApplyEventSchema: typeof _openRetreatFromAttackApplyEventSchemaObject =
  _openRetreatFromAttackApplyEventSchemaObject;

const _assertExactOpenRetreatFromAttackApplyEvent: AssertExact<
  OpenRetreatFromAttackApplyEvent,
  OpenRetreatFromAttackApplyEventSchemaType
> = true;
