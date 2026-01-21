import type { Board } from '@entities';
import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { CHOOSE_ROUT_DISCARD_CHOICE_TYPE } from './playerChoice';

/**
 * An event to choose which cards to discard as a penalty for routed units.
 * The player must select a number of cards equal to the total rout penalty.
 */
export interface ChooseRoutDiscardEvent<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_ROUT_DISCARD_CHOICE_TYPE;
  /** The player who is discarding cards. */
  player: PlayerSide;
  /** The IDs of the cards being discarded (from hand). */
  cardIds: string[];
}

const _chooseRoutDiscardEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(CHOOSE_ROUT_DISCARD_CHOICE_TYPE),
  /** The player who is discarding cards. */
  player: playerSideSchema,
  /** The IDs of the cards being discarded (from hand). */
  cardIds: z.array(z.uuid()),
});

type ChooseRoutDiscardEventSchemaType = z.infer<
  typeof _chooseRoutDiscardEventSchemaObject
>;

/** The schema for a choose rout discard event. */
export const chooseRoutDiscardEventSchema: z.ZodType<ChooseRoutDiscardEvent> =
  _chooseRoutDiscardEventSchemaObject;

// Verify manual type matches schema inference
const _assertExactChooseRoutDiscardEvent: AssertExact<
  ChooseRoutDiscardEvent,
  ChooseRoutDiscardEventSchemaType
> = true;
