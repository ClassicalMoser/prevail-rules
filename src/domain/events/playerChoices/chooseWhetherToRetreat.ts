import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the choose whether to retreat player choice. */
export const CHOOSE_WHETHER_TO_RETREAT_CHOICE_TYPE =
  'chooseWhetherToRetreat' as const;

/**
 * A defender engaged from the front that is faster than its attacker, and
 * has somewhere to go, may fall back instead of fighting (§6.3.2). Its owner
 * decides whether it does.
 *
 * `getLegalChooseWhetherToRetreatEvents` enumerates the legal options, and
 * `applyChooseWhetherToRetreatEvent` applies the choice.
 */
export interface ChooseWhetherToRetreatEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof CHOOSE_WHETHER_TO_RETREAT_CHOICE_TYPE;
  /** The defender's owner. */
  player: PlayerSide;
  /** Whether the defender falls back. */
  choosesToRetreat: boolean;
}

const _chooseWhetherToRetreatEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(CHOOSE_WHETHER_TO_RETREAT_CHOICE_TYPE),
    /** The defender's owner. */
    player: playerSideSchema,
    /** Whether the defender falls back. */
    choosesToRetreat: z.boolean(),
  })
  .strict();

type ChooseWhetherToRetreatEventSchemaType = z.infer<
  typeof _chooseWhetherToRetreatEventSchemaObject
>;

const _assertExactChooseWhetherToRetreatEvent: AssertExact<
  ChooseWhetherToRetreatEvent,
  ChooseWhetherToRetreatEventSchemaType
> = true;

/** The schema for a choose whether to retreat event. */
export const chooseWhetherToRetreatEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'chooseWhetherToRetreat'>;
  player: typeof playerSideSchema;
  choosesToRetreat: z.ZodBoolean;
}> = _chooseWhetherToRetreatEventSchemaObject;
