import type { CommandAllocation, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { commandAllocationSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the issue commands player choice. */
export const ISSUE_COMMANDS_CHOICE_TYPE = 'issueCommands' as const;

/**
 * In Phase 3 a player issues all their orders, then carries them out (§4.3).
 * Nothing happens between one order and the next, so the whole allocation of
 * the card in play's command is one choice: a units command's one order, or
 * a lines command's lines. Whatever it leaves unissued is forfeited (§4.3.3),
 * and an allocation that orders nobody declines (§4.3.2).
 *
 * `getLegalIssueCommands` offers it a unit or a line at a time, and
 * `applyIssueCommandsEvent` applies the choice.
 */
export interface IssueCommandsEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof ISSUE_COMMANDS_CHOICE_TYPE;
  /** The player issuing their orders. */
  player: PlayerSide;
  /** How they spend the command on their card in play. */
  allocation: CommandAllocation;
}

const _issueCommandsEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(ISSUE_COMMANDS_CHOICE_TYPE),
    /** The player issuing their orders. */
    player: playerSideSchema,
    /** How they spend the command on their card in play. */
    allocation: commandAllocationSchema,
  })
  .strict();

type IssueCommandsEventSchemaType = z.infer<
  typeof _issueCommandsEventSchemaObject
>;

const _assertExactIssueCommandsEvent: AssertExact<
  IssueCommandsEvent,
  IssueCommandsEventSchemaType
> = true;

/** The schema for an issue commands event. */
export const issueCommandsEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'issueCommands'>;
  player: typeof playerSideSchema;
  allocation: typeof commandAllocationSchema;
}> = _issueCommandsEventSchemaObject;
