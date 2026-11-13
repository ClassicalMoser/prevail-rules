import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the done-issuing-commands event. */
export const DONE_ISSUING_COMMANDS_CHOICE_TYPE = 'doneIssuingCommands' as const;

/**
 * In Phase 3 a player stops giving orders before the card runs out. Whatever
 * is not issued is forfeited (§4.3.3). A units order may be declined
 * altogether (§4.3.2), which is this same event with nothing issued.
 *
 * `getLegalDoneIssuingCommandsEvents` enumerates the legal options, and
 * `applyDoneIssuingCommandsEvent` applies the choice.
 */
export interface DoneIssuingCommandsEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof DONE_ISSUING_COMMANDS_CHOICE_TYPE;
  /** The player who stops giving orders. */
  player: PlayerSide;
}

const _doneIssuingCommandsEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(DONE_ISSUING_COMMANDS_CHOICE_TYPE),
    /** The player who stops giving orders. */
    player: playerSideSchema,
  })
  .strict();

type DoneIssuingCommandsEventSchemaType = z.infer<
  typeof _doneIssuingCommandsEventSchemaObject
>;

const _assertExactDoneIssuingCommandsEvent: AssertExact<
  DoneIssuingCommandsEvent,
  DoneIssuingCommandsEventSchemaType
> = true;

/** The schema for a done-issuing-commands event. */
export const doneIssuingCommandsEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'doneIssuingCommands'>;
  player: typeof playerSideSchema;
}> = _doneIssuingCommandsEventSchemaObject;
