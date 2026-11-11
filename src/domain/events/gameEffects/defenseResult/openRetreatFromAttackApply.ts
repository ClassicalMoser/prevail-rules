import type { MoveDelta, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { moveDeltaSchema, playerSideSchema } from '@entities';
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
 * The procedure sets the branch and works out the retreats the unit may make,
 * so the log records what was legal; apply only writes them.
 */
export type OpenRetreatFromAttackApplyEvent =
  | {
      /** The type of the event. */
      eventType: typeof GAME_EFFECT_EVENT_TYPE;
      /** The type of game effect. */
      effectType: typeof OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE;
      /** The apply lives under ranged attack resolution. */
      attackResolutionContext: typeof RANGED_ATTACK_RESOLUTION_CONTEXT;
      /** The retreats the unit may make, each as its path (§9.1.3); empty when it routs instead (§9.1.6). */
      retreatPaths: MoveDelta[][];
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
      /** The retreats the unit may make, each as its path (§9.1.3); empty when it routs instead (§9.1.6). */
      retreatPaths: MoveDelta[][];
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
  retreatPaths: z.ZodArray<z.ZodArray<typeof moveDeltaSchema>>;
}> = _openRetreatFromAttackApplySharedFieldsSchemaObject.merge(
  z
    .object({
      /** Ranged attack resolution path. */
      attackResolutionContext: z.literal(RANGED_ATTACK_RESOLUTION_CONTEXT),
      /** The retreats the unit may make, each as its path. */
      retreatPaths: z.array(z.array(moveDeltaSchema)),
    })
    .strict(),
);

const _openRetreatFromAttackApplyMeleeSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE>;
  attackResolutionContext: z.ZodLiteral<typeof MELEE_ATTACK_RESOLUTION_CONTEXT>;
  defendingPlayer: typeof playerSideSchema;
  retreatPaths: z.ZodArray<z.ZodArray<typeof moveDeltaSchema>>;
}> = _openRetreatFromAttackApplySharedFieldsSchemaObject.merge(
  z
    .object({
      /** Melee resolution path. */
      attackResolutionContext: z.literal(MELEE_ATTACK_RESOLUTION_CONTEXT),
      /** The defending player whose apply still has a pending retreat. */
      defendingPlayer: playerSideSchema,
      /** The retreats the unit may make, each as its path. */
      retreatPaths: z.array(z.array(moveDeltaSchema)),
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
