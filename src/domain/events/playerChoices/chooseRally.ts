import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the choose rally event. */
export const CHOOSE_RALLY_CHOICE_TYPE = 'chooseRally' as const;

/**
 * An event to choose a rally from the player's hand.
 *
 * TODO(misleading): nothing is chosen from the hand; the event says whether
 * the player rallies at Cleanup (§10.3.1), and the card burnt is drawn at
 * random (§10.3.2). Settled by describing it as the decision to rally.
 */
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

const _chooseRallyEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** The type of player choice. */
    choiceType: z.literal(CHOOSE_RALLY_CHOICE_TYPE),
    /** The player who is choosing whether to perform a rally. */
    player: playerSideSchema,
    /** Whether the player is performing a rally. */
    performRally: z.boolean(),
  })
  .strict();

type ChooseRallyEventSchemaType = z.infer<typeof _chooseRallyEventSchemaObject>;

// Verify manual type matches schema inference
const _assertExactChooseRallyEvent: AssertExact<
  ChooseRallyEvent,
  ChooseRallyEventSchemaType
> = true;

/** The schema for a choose rally event. */
export const chooseRallyEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'chooseRally'>;
  player: typeof playerSideSchema;
  performRally: z.ZodBoolean;
}> = _chooseRallyEventSchemaObject;
