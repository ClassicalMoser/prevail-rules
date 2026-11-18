import type { MoveDelta, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { moveDeltaSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the choose retreat option player choice. */
export const CHOOSE_RETREAT_OPTION_CHOICE_TYPE = 'chooseRetreatOption' as const;

/**
 * A retreat must be the smallest backward move available; where several tie,
 * the unit's owner chooses among them (§9.1.3).
 *
 * `getLegalChooseRetreatOptionEvents` enumerates the legal options, and
 * `applyChooseRetreatOptionEvent` applies the choice.
 */
export interface ChooseRetreatOptionEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof CHOOSE_RETREAT_OPTION_CHOICE_TYPE;
  /** The retreating unit's owner. */
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
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(CHOOSE_RETREAT_OPTION_CHOICE_TYPE),
    /** The retreating unit's owner. */
    player: playerSideSchema,
    /** The retreat chosen, named by its path (§9.1.3). */
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

/** The schema for a choose retreat option event. */
export const chooseRetreatOptionEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof CHOOSE_RETREAT_OPTION_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  path: z.ZodArray<typeof moveDeltaSchema>;
}> = _chooseRetreatOptionEventSchemaObject;
