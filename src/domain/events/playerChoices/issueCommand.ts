import type { Command, PlayerSide, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { commandSchema, playerSideSchema, unitInstanceSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the issue command player choice. */
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
 * A line, listed unit by unit in rank order from either end; a line of one
 * lists one unit (§4.3.5). Every unit listed is ordered, and validation
 * checks that the list is a whole legal line.
 */
export interface LineOrderSelection {
  /** A line order. */
  selectionType: 'line';
  /** Every unit of the line, in rank order from either end. */
  units: UnitInstance[];
}

/** What an order is given to: some units, or one line. */
export type OrderSelection = UnitsOrderSelection | LineOrderSelection;

/**
 * One order from the card in play (§4.3): which of the card's commands is
 * used, and the units or the line it is given to.
 */
export interface Order {
  /** The command on the card in play that this order uses (§4.3.1). */
  command: Command;
  /** The units, or the line, the order is given to. */
  selection: OrderSelection;
}

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
  /** The order given, or `null` to stop giving orders (§4.3.3). */
  order: Order | null;
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
  units: z.ZodArray<typeof unitInstanceSchema>;
}> = z
  .object({
    /** A line order. */
    selectionType: z.literal('line'),
    /** Every unit of the line, in rank order from either end. */
    units: z.array(unitInstanceSchema),
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

const _orderSchemaObject: z.ZodObject<{
  command: typeof commandSchema;
  selection: typeof _orderSelectionSchemaObject;
}> = z
  .object({
    /** The command on the card in play that this order uses (§4.3.1). */
    command: commandSchema,
    /** The units, or the line, the order is given to. */
    selection: _orderSelectionSchemaObject,
  })
  .strict();

const _issueCommandEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(ISSUE_COMMAND_CHOICE_TYPE),
    /** The player giving the order, or stopping. */
    player: playerSideSchema,
    /** The order given, or `null` to stop giving orders (§4.3.3). */
    order: _orderSchemaObject.nullable(),
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
  order: z.ZodNullable<typeof _orderSchemaObject>;
}> = _issueCommandEventSchemaObject;
