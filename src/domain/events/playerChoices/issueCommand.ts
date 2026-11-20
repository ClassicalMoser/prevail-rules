import type { Order, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { orderSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the issue command player choice. */
export const ISSUE_COMMAND_CHOICE_TYPE = 'issueCommand' as const;

/**
 * In Phase 3 a player gives their orders one at a time, or stops. A units
 * order names up to the card's number of units (§4.3.2); a lines order is one
 * line per order (§4.3.3).
 *
 * Stopping is this same choice with no order. Whatever is not issued is
 * forfeited (§4.3.3), and a units order may be declined altogether (§4.3.2).
 * Stopping is always legal while orders are left, and when none of them can
 * be given to anyone it is the only legal option.
 *
 * `getLegalIssueCommands` enumerates the legal options, and
 * `applyIssueCommandEvent` applies the choice.
 */
export interface IssueCommandEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof ISSUE_COMMAND_CHOICE_TYPE;
  /** The player giving the order, or stopping. */
  player: PlayerSide;
  /** The order given, or `'none'` to stop giving orders (§4.3.3). */
  order: Order | 'none';
}

const _issueCommandEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(ISSUE_COMMAND_CHOICE_TYPE),
    /** The player giving the order, or stopping. */
    player: playerSideSchema,
    /** The order given, or `'none'` to stop giving orders (§4.3.3). */
    order: orderSchema.or(z.literal('none')),
  })
  .strict();

type IssueCommandEventSchemaType = z.infer<
  typeof _issueCommandEventSchemaObject
>;

const _assertExactIssueCommandEvent: AssertExact<
  IssueCommandEvent,
  IssueCommandEventSchemaType
> = true;

/** The schema for an issue command event. */
export const issueCommandEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'issueCommand'>;
  player: typeof playerSideSchema;
  order: z.ZodUnion<readonly [typeof orderSchema, z.ZodLiteral<'none'>]>;
}> = _issueCommandEventSchemaObject;
