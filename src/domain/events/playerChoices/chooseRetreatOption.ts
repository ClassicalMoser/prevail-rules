import type { MoveDelta, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { moveDeltaSchema, playerSideSchema } from '@entities';
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
  /**
   * The retreat chosen, named by its path (§9.1.3). Where it ends is read
   * from the path, as a move's is; a commander in the unit's space always
   * goes with it (§9.1.8), so there is nothing else to say.
   */
  path: MoveDelta[];
}

const _chooseRetreatOptionEventSchemaObject = z
  .object({
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    choiceType: z.literal(CHOOSE_RETREAT_OPTION_CHOICE_TYPE),
    player: playerSideSchema,
    path: z.array(moveDeltaSchema),
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
  path: z.ZodArray<typeof moveDeltaSchema>;
}> = _chooseRetreatOptionEventSchemaObject;
