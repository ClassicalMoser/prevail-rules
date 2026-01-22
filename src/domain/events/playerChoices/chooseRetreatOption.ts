import type { Board, PlayerSide, UnitPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitPlacementSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

export const CHOOSE_RETREAT_OPTION_CHOICE_TYPE = 'chooseRetreatOption' as const;

export interface ChooseRetreatOptionEvent<
  TBoard extends Board,
  _TChoiceType extends 'chooseRetreatOption' = 'chooseRetreatOption',
> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_RETREAT_OPTION_CHOICE_TYPE;
  /** The player who is choosing the retreat option. */
  player: PlayerSide;
  /** The retreat option to choose from. */
  retreatOption: UnitPlacement<TBoard>;
}

const _chooseRetreatOptionEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(CHOOSE_RETREAT_OPTION_CHOICE_TYPE),
  /** The player who is choosing the retreat option. */
  player: playerSideSchema,
  /** The retreat option to choose from. */
  retreatOption: unitPlacementSchema,
});

type ChooseRetreatOptionEventSchemaType = z.infer<
  typeof _chooseRetreatOptionEventSchemaObject
>;

const _assertExactChooseRetreatOptionEvent: AssertExact<
  ChooseRetreatOptionEvent<Board>,
  ChooseRetreatOptionEventSchemaType
> = true;

/** The schema for a player choice to retreat. */
export const chooseRetreatOptionEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'chooseRetreatOption'>;
  player: typeof playerSideSchema;
  retreatOption: typeof unitPlacementSchema;
}> = _chooseRetreatOptionEventSchemaObject;
