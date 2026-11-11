import type { MoveDelta } from '@entities';
import { moveDeltaSchema } from '@entities';
import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the openRetreatFromAttackApply game effect. */
export const OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE =
  'openRetreatFromAttackApply' as const;

/**
 * Opens the retreat substep on an attack apply whose retreat slot is still
 * `'pending'`. The attack already measured a retreat; this event writes the
 * substep (and its legal options) when that step's turn comes.
 *
 * The procedure works out the retreats the unit may make, so the log records
 * what was legal; apply only writes them. Which apply opens is the state's to
 * name (`getAttackApplyAwaitingOpen`), not the event's.
 */
export interface OpenRetreatFromAttackApplyEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE;
  /** The retreats the unit may make, each as its path (§9.1.3); empty when it routs instead (§9.1.6). */
  retreatPaths: MoveDelta[][];
}

const _openRetreatFromAttackApplyEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE),
    /** The retreats the unit may make, each as its path. */
    retreatPaths: z.array(z.array(moveDeltaSchema)),
  })
  .strict();

type OpenRetreatFromAttackApplyEventSchemaType = z.infer<
  typeof _openRetreatFromAttackApplyEventSchemaObject
>;

const _assertExactOpenRetreatFromAttackApplyEvent: AssertExact<
  OpenRetreatFromAttackApplyEvent,
  OpenRetreatFromAttackApplyEventSchemaType
> = true;

/** The schema for an openRetreatFromAttackApply event. */
export const openRetreatFromAttackApplyEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'openRetreatFromAttackApply'>;
  retreatPaths: z.ZodArray<z.ZodArray<typeof moveDeltaSchema>>;
}> = _openRetreatFromAttackApplyEventSchemaObject;
