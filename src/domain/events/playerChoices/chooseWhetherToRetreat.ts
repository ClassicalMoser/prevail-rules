import type { Board, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

export const CHOOSE_WHETHER_TO_RETREAT_CHOICE_TYPE =
  'chooseWhetherToRetreat' as const;

/** The event for a player choosing whether to retreat. */
export interface ChooseWhetherToRetreatEvent<
  _TBoard extends Board,
  _TChoiceType extends 'chooseWhetherToRetreat' = 'chooseWhetherToRetreat',
> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_WHETHER_TO_RETREAT_CHOICE_TYPE;
  /** The player who is choosing whether to retreat. */
  player: PlayerSide;
  /** Whether the player chooses to retreat. */
  choosesToRetreat: boolean;
}

const _chooseWhetherToRetreatEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(CHOOSE_WHETHER_TO_RETREAT_CHOICE_TYPE),
  /** The player who is choosing whether to retreat. */
  player: playerSideSchema,
  /** Whether the player chooses to retreat. */
  choosesToRetreat: z.boolean(),
});

type ChooseWhetherToRetreatEventSchemaType = z.infer<
  typeof _chooseWhetherToRetreatEventSchemaObject
>;

const _assertExactChooseWhetherToRetreatEvent: AssertExact<
  ChooseWhetherToRetreatEvent<Board>,
  ChooseWhetherToRetreatEventSchemaType
> = true;

/** The schema for a player choice whether or not to retreat. */
export const chooseWhetherToRetreatEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'chooseWhetherToRetreat'>;
  player: typeof playerSideSchema;
  choosesToRetreat: z.ZodBoolean;
}> = _chooseWhetherToRetreatEventSchemaObject;
