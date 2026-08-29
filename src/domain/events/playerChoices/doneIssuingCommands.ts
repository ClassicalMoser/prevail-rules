import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the done-issuing-commands event. */
export const DONE_ISSUING_COMMANDS_CHOICE_TYPE = 'doneIssuingCommands' as const;

/**
 * Player ends their issue-commands step, forfeiting any remaining command slots
 * (“issue all commands you want to give”).
 */
export interface DoneIssuingCommandsEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof DONE_ISSUING_COMMANDS_CHOICE_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is done issuing. */
  player: PlayerSide;
}

const _doneIssuingCommandsEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** The type of player choice. */
    choiceType: z.literal(DONE_ISSUING_COMMANDS_CHOICE_TYPE),
    /** The ordered index of the event in the round, zero-indexed. */
    eventNumber: z.number(),
    /** The player who is done issuing. */
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
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
}> = _doneIssuingCommandsEventSchemaObject;
