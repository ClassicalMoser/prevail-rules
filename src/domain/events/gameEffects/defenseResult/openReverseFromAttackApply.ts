import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

import {
  MELEE_ATTACK_RESOLUTION_CONTEXT,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from './attackResolutionContext';

/** The type of the open-reverse-from-attack-apply game effect. */
export const OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE =
  'openReverseFromAttackApply' as const;

/**
 * Opens the reverse substep on an attack apply whose reverse slot is still
 * `'pending'`. The attack already measured a reverse; this event writes the
 * substep when that step's turn comes (after any retreat has moved the unit).
 *
 * Procedure sets the branch; apply trusts it.
 */
export type OpenReverseFromAttackApplyEvent =
  | {
      /** The type of the event. */
      eventType: typeof GAME_EFFECT_EVENT_TYPE;
      /** The type of game effect. */
      effectType: typeof OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE;
      /** The apply lives under ranged attack resolution. */
      attackResolutionContext: typeof RANGED_ATTACK_RESOLUTION_CONTEXT;
    }
  | {
      /** The type of the event. */
      eventType: typeof GAME_EFFECT_EVENT_TYPE;
      /** The type of game effect. */
      effectType: typeof OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE;
      /** The apply lives under this player's melee attack-apply. */
      attackResolutionContext: typeof MELEE_ATTACK_RESOLUTION_CONTEXT;
      /** The defending player whose apply still has a pending reverse. */
      defendingPlayer: PlayerSide;
    };

const _openReverseFromAttackApplySharedFieldsSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE>;
}> = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE),
  })
  .strict();

const _openReverseFromAttackApplyRangedAttackSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE>;
  attackResolutionContext: z.ZodLiteral<
    typeof RANGED_ATTACK_RESOLUTION_CONTEXT
  >;
}> = _openReverseFromAttackApplySharedFieldsSchemaObject.merge(
  z
    .object({
      /** Ranged attack resolution path. */
      attackResolutionContext: z.literal(RANGED_ATTACK_RESOLUTION_CONTEXT),
    })
    .strict(),
);

const _openReverseFromAttackApplyMeleeSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE>;
  attackResolutionContext: z.ZodLiteral<typeof MELEE_ATTACK_RESOLUTION_CONTEXT>;
  defendingPlayer: typeof playerSideSchema;
}> = _openReverseFromAttackApplySharedFieldsSchemaObject.merge(
  z
    .object({
      /** Melee resolution path. */
      attackResolutionContext: z.literal(MELEE_ATTACK_RESOLUTION_CONTEXT),
      /** The defending player whose apply still has a pending reverse. */
      defendingPlayer: playerSideSchema,
    })
    .strict(),
);

/** Branches share `effectType`; nested discrimination uses `attackResolutionContext`. */
const _openReverseFromAttackApplyEventSchemaObject: z.ZodDiscriminatedUnion<
  [
    typeof _openReverseFromAttackApplyRangedAttackSchemaObject,
    typeof _openReverseFromAttackApplyMeleeSchemaObject,
  ],
  'attackResolutionContext'
> = z.discriminatedUnion('attackResolutionContext', [
  _openReverseFromAttackApplyRangedAttackSchemaObject,
  _openReverseFromAttackApplyMeleeSchemaObject,
]);

type OpenReverseFromAttackApplyEventSchemaType = z.infer<
  typeof _openReverseFromAttackApplyEventSchemaObject
>;

/** The schema for an open-reverse-from-attack-apply event. */
export const openReverseFromAttackApplyEventSchema: typeof _openReverseFromAttackApplyEventSchemaObject =
  _openReverseFromAttackApplyEventSchemaObject;

const _assertExactOpenReverseFromAttackApplyEvent: AssertExact<
  OpenReverseFromAttackApplyEvent,
  OpenReverseFromAttackApplyEventSchemaType
> = true;
