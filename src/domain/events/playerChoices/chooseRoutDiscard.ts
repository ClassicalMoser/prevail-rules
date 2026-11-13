import type { CommandCard, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the choose rout discard event. */
export const CHOOSE_ROUT_DISCARD_CHOICE_TYPE = 'chooseRoutDiscard' as const;

/**
 * When a unit routs, its owner discards cards from hand equal to its Morale,
 * chosen freely (§9.3.2). Units of one player that rout at the same moment
 * are paid for together, their Morale summed (§9.3.3).
 *
 * `getLegalRoutDiscardCards` enumerates the legal options, and
 * `applyChooseRoutDiscardEvent` applies the choice.
 */
export interface ChooseRoutDiscardEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof CHOOSE_ROUT_DISCARD_CHOICE_TYPE;
  /** The player paying for the rout. */
  player: PlayerSide;
  /**
   * The cards being discarded, from hand. A discard is face up, so the event
   * shows the cards themselves: a seat that cannot see this player's hand
   * still sees what was spent.
   */
  cards: CommandCard[];
}

const _chooseRoutDiscardEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(CHOOSE_ROUT_DISCARD_CHOICE_TYPE),
    /** The player paying for the rout. */
    player: playerSideSchema,
    /** The cards being discarded, from hand. */
    cards: z.array(commandCardSchema),
  })
  .strict();

type ChooseRoutDiscardEventSchemaType = z.infer<
  typeof _chooseRoutDiscardEventSchemaObject
>;

/** The schema for a choose rout discard event. */
export const chooseRoutDiscardEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'chooseRoutDiscard'>;
  player: typeof playerSideSchema;
  cards: z.ZodArray<typeof commandCardSchema>;
}> = _chooseRoutDiscardEventSchemaObject;

// Verify manual type matches schema inference
const _assertExactChooseRoutDiscardEvent: AssertExact<
  ChooseRoutDiscardEvent,
  ChooseRoutDiscardEventSchemaType
> = true;
