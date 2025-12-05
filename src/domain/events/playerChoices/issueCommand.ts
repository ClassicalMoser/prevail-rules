import type { Command, PlayerSide, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { commandSchema, playerSideSchema, unitInstanceSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import { z } from 'zod';
import { ISSUE_COMMAND_CHOICE_TYPE } from './playerChoice';

export interface IssueCommandEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof ISSUE_COMMAND_CHOICE_TYPE;
  /** The player who is issuing the commands. */
  player: PlayerSide;
  /** The commands to issue. */
  command: Command;
  /** The units to apply the commands to. */
  units: Set<UnitInstance>;
}

const _issueCommandEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(ISSUE_COMMAND_CHOICE_TYPE),
  /** The player who is issuing the commands. */
  player: playerSideSchema,
  /** The commands to issue. */
  command: commandSchema,
  /** The units to apply the commands to. */
  units: z.set(unitInstanceSchema),
});

type IssueCommandEventSchemaType = z.infer<
  typeof _issueCommandEventSchemaObject
>;

const _assertExactIssueCommandEvent: AssertExact<
  IssueCommandEvent,
  IssueCommandEventSchemaType
> = true;

/** The schema for the issue commands event. */
export const issueCommandEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof ISSUE_COMMAND_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  command: typeof commandSchema;
  units: z.ZodSet<typeof unitInstanceSchema>;
}> = _issueCommandEventSchemaObject;
