import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the choose rally event. */
export const CHOOSE_RALLY_CHOICE_TYPE = 'chooseRally' as const;

/**
 * In Cleanup each player in turn decides whether to rally, the first player
 * first (§4.5.2, §10.3.1). A rally burns one played card, drawn at random,
 * and brings every other card back to hand; the unit support check follows
 * (§10.3.2). Declining changes nothing (§10.3.4).
 *
 * `getLegalChooseRallyEvent` enumerates the legal options, and
 * `applyChooseRallyEvent` applies the choice.
 */
export interface ChooseRallyEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof CHOOSE_RALLY_CHOICE_TYPE;
  /** The player deciding whether to rally. */
  player: PlayerSide;
  /** Whether the player rallies. */
  performRally: boolean;
}

const _chooseRallyEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(CHOOSE_RALLY_CHOICE_TYPE),
    /** The player deciding whether to rally. */
    player: playerSideSchema,
    /** Whether the player rallies. */
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
