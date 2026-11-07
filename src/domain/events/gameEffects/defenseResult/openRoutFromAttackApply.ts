import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

import {
  MELEE_ATTACK_RESOLUTION_CONTEXT,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from './attackResolutionContext';

/** The type of the open-rout-from-attack-apply game effect. */
export const OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE =
  'openRoutFromAttackApply' as const;

/**
 * Opens the rout substep on an attack apply whose rout slot is still
 * `'pending'`. The attack already measured a rout; this event writes the
 * substep when that step's turn comes.
 *
 * Procedure sets the branch; apply trusts it.
 */
export type OpenRoutFromAttackApplyEvent =
  | {
      /** The type of the event. */
      eventType: typeof GAME_EFFECT_EVENT_TYPE;
      /** The type of game effect. */
      effectType: typeof OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE;
      /** The apply lives under ranged attack resolution. */
      attackResolutionContext: typeof RANGED_ATTACK_RESOLUTION_CONTEXT;
      /** The ordered index of the event in the round, zero-indexed. */
      eventNumber: number;
    }
  | {
      /** The type of the event. */
      eventType: typeof GAME_EFFECT_EVENT_TYPE;
      /** The type of game effect. */
      effectType: typeof OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE;
      /** The apply lives under this player's melee attack-apply. */
      attackResolutionContext: typeof MELEE_ATTACK_RESOLUTION_CONTEXT;
      /** The defending player whose apply still has a pending rout. */
      defendingPlayer: PlayerSide;
      /** The ordered index of the event in the round, zero-indexed. */
      eventNumber: number;
    };

const _openRoutFromAttackApplySharedFieldsSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE>;
}> = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE),
  })
  .strict();

const _openRoutFromAttackApplyRangedAttackSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE>;
  attackResolutionContext: z.ZodLiteral<
    typeof RANGED_ATTACK_RESOLUTION_CONTEXT
  >;
  eventNumber: z.ZodNumber;
}> = _openRoutFromAttackApplySharedFieldsSchemaObject.merge(
  z
    .object({
      /** Ranged attack resolution path. */
      attackResolutionContext: z.literal(RANGED_ATTACK_RESOLUTION_CONTEXT),
      /** The ordered index of the event in the round, zero-indexed. */
      eventNumber: z.number(),
    })
    .strict(),
);

const _openRoutFromAttackApplyMeleeSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE>;
  attackResolutionContext: z.ZodLiteral<typeof MELEE_ATTACK_RESOLUTION_CONTEXT>;
  defendingPlayer: typeof playerSideSchema;
  eventNumber: z.ZodNumber;
}> = _openRoutFromAttackApplySharedFieldsSchemaObject.merge(
  z
    .object({
      /** Melee resolution path. */
      attackResolutionContext: z.literal(MELEE_ATTACK_RESOLUTION_CONTEXT),
      /** The defending player whose apply still has a pending rout. */
      defendingPlayer: playerSideSchema,
      /** The ordered index of the event in the round, zero-indexed. */
      eventNumber: z.number(),
    })
    .strict(),
);

/** Branches share `effectType`; nested discrimination uses `attackResolutionContext`. */
const _openRoutFromAttackApplyEventSchemaObject: z.ZodDiscriminatedUnion<
  [
    typeof _openRoutFromAttackApplyRangedAttackSchemaObject,
    typeof _openRoutFromAttackApplyMeleeSchemaObject,
  ],
  'attackResolutionContext'
> = z.discriminatedUnion('attackResolutionContext', [
  _openRoutFromAttackApplyRangedAttackSchemaObject,
  _openRoutFromAttackApplyMeleeSchemaObject,
]);

type OpenRoutFromAttackApplyEventSchemaType = z.infer<
  typeof _openRoutFromAttackApplyEventSchemaObject
>;

/** The schema for an open-rout-from-attack-apply event. */
export const openRoutFromAttackApplyEventSchema: typeof _openRoutFromAttackApplyEventSchemaObject =
  _openRoutFromAttackApplyEventSchemaObject;

const _assertExactOpenRoutFromAttackApplyEvent: AssertExact<
  OpenRoutFromAttackApplyEvent,
  OpenRoutFromAttackApplyEventSchemaType
> = true;
