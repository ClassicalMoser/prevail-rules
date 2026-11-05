import type { PlayerSide, UnitPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitPlacementSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

export const CHOOSE_RETREAT_OPTION_CHOICE_TYPE = 'chooseRetreatOption' as const;

export interface ChooseRetreatOptionEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_RETREAT_OPTION_CHOICE_TYPE;
  /** The player who is choosing the retreat option. */
  player: PlayerSide;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The retreat option to choose from. */
  retreatOption: UnitPlacement;
}

const _chooseRetreatOptionEventSchemaObject = z
  .object({
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    choiceType: z.literal(CHOOSE_RETREAT_OPTION_CHOICE_TYPE),
    player: playerSideSchema,
    eventNumber: z.number(),
    retreatOption: unitPlacementSchema,
  })
  .strict();

type ChooseRetreatOptionEventSchemaType = z.infer<
  typeof _chooseRetreatOptionEventSchemaObject
>;

const _assertExactChooseRetreatOptionEvent: AssertExact<
  ChooseRetreatOptionEvent,
  ChooseRetreatOptionEventSchemaType
> = true;

/** The schema for a player choice to retreat. */
export const chooseRetreatOptionEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof CHOOSE_RETREAT_OPTION_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  eventNumber: z.ZodNumber;
  retreatOption: typeof unitPlacementSchema;
}> = _chooseRetreatOptionEventSchemaObject;
