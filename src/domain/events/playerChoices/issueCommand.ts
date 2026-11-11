import type { Command, PlayerSide, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { commandSchema, playerSideSchema, unitInstanceSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the issue command event. */
export const ISSUE_COMMAND_CHOICE_TYPE = 'issueCommand' as const;

/**
 * The units a units order commands: one to the order's number (§4.3.2), in
 * any order.
 */
export interface UnitsOrderSelection {
  /** A units order. */
  selectionType: 'units';
  /** The units ordered. */
  units: UnitInstance[];
}

/**
 * A line, named by its two ends in either order; a line of one names the
 * same unit twice (§4.3.5). The units between them are the board's to say.
 */
export interface LineOrderSelection {
  /** A line order. */
  selectionType: 'line';
  /** The two ends of the line. */
  ends: [UnitInstance, UnitInstance];
}

/** What an order is given to: some units, or one line. */
export type OrderSelection = UnitsOrderSelection | LineOrderSelection;

export interface IssueCommandEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof ISSUE_COMMAND_CHOICE_TYPE;
  /** The player who is issuing the commands. */
  player: PlayerSide;
  /** The commands to issue. */
  command: Command;
  /** The units, or the line, the order is given to. */
  selection: OrderSelection;
}

const _unitsOrderSelectionSchemaObject: z.ZodObject<{
  selectionType: z.ZodLiteral<'units'>;
  units: z.ZodArray<typeof unitInstanceSchema>;
}> = z
  .object({
    /** A units order. */
    selectionType: z.literal('units'),
    /** The units ordered. */
    units: z.array(unitInstanceSchema),
  })
  .strict();

const _lineOrderSelectionSchemaObject: z.ZodObject<{
  selectionType: z.ZodLiteral<'line'>;
  ends: z.ZodTuple<
    [typeof unitInstanceSchema, typeof unitInstanceSchema],
    null
  >;
}> = z
  .object({
    /** A line order. */
    selectionType: z.literal('line'),
    /** The two ends of the line. */
    ends: z.tuple([unitInstanceSchema, unitInstanceSchema]),
  })
  .strict();

const _orderSelectionSchemaObject: z.ZodDiscriminatedUnion<
  [
    typeof _unitsOrderSelectionSchemaObject,
    typeof _lineOrderSelectionSchemaObject,
  ],
  'selectionType'
> = z.discriminatedUnion('selectionType', [
  _unitsOrderSelectionSchemaObject,
  _lineOrderSelectionSchemaObject,
]);

const _issueCommandEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** The type of player choice. */
    choiceType: z.literal(ISSUE_COMMAND_CHOICE_TYPE),
    /** The player who is issuing the commands. */
    player: playerSideSchema,
    /** The commands to issue. */
    command: commandSchema,
    /** The units, or the line, the order is given to. */
    selection: _orderSelectionSchemaObject,
  })
  .strict();

type IssueCommandEventSchemaType = z.infer<
  typeof _issueCommandEventSchemaObject
>;

const _assertExactIssueCommandEvent: AssertExact<
  IssueCommandEvent,
  IssueCommandEventSchemaType
> = true;

/** The schema for the issue commands event. */
export const issueCommandEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'issueCommand'>;
  player: typeof playerSideSchema;
  command: typeof commandSchema;
  selection: typeof _orderSelectionSchemaObject;
}> = _issueCommandEventSchemaObject;
