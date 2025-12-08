import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { CHOOSE_RALLY_CHOICE_TYPE } from './playerChoice';


/** An event to choose a rally from the player's hand. */
export interface ChooseRallyEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_RALLY_CHOICE_TYPE;
  /** The player who is choosing whether to perform a rally. */
  player: PlayerSide;
  /** Whether the player is performing a rally. */
  performRally: boolean;
}

const _chooseRallyEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(CHOOSE_RALLY_CHOICE_TYPE),
  /** The player who is choosing whether to perform a rally. */
  player: playerSideSchema,
  /** Whether the player is performing a rally. */
  performRally: z.boolean(),
});

type ChooseRallyEventSchemaType = z.infer<typeof _chooseRallyEventSchemaObject>;

/** The schema for a choose rally event. */
export const chooseRallyEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof CHOOSE_RALLY_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  performRally: z.ZodBoolean;
}> = _chooseRallyEventSchemaObject;

// Verify manual type matches schema inference
const _assertExactChooseRallyEvent: AssertExact<
  ChooseRallyEvent,
  ChooseRallyEventSchemaType
> = true;
