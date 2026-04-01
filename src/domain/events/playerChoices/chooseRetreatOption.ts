import type {
  Board,
  LargeBoard,
  LargeUnitPlacement,
  PlayerSide,
  SmallBoard,
  SmallUnitPlacement,
  StandardBoard,
  StandardUnitPlacement,
} from '@entities';
import type { AssertExact } from '@utils';
import {
  largeUnitPlacementSchema,
  playerSideSchema,
  smallUnitPlacementSchema,
  standardUnitPlacementSchema,
} from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

export const CHOOSE_RETREAT_OPTION_CHOICE_TYPE = 'chooseRetreatOption' as const;

interface ChooseRetreatOptionEventBase {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_RETREAT_OPTION_CHOICE_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is choosing the retreat option. */
  player: PlayerSide;
}

export interface StandardChooseRetreatOptionEvent extends ChooseRetreatOptionEventBase {
  boardType: 'standard';
  /** The retreat option to choose from. */
  retreatOption: StandardUnitPlacement;
}

export interface SmallChooseRetreatOptionEvent extends ChooseRetreatOptionEventBase {
  boardType: 'small';
  retreatOption: SmallUnitPlacement;
}

export interface LargeChooseRetreatOptionEvent extends ChooseRetreatOptionEventBase {
  boardType: 'large';
  retreatOption: LargeUnitPlacement;
}

export type ChooseRetreatOptionEventUnion =
  | StandardChooseRetreatOptionEvent
  | SmallChooseRetreatOptionEvent
  | LargeChooseRetreatOptionEvent;

export type ChooseRetreatOptionEvent<
  TBoard extends Board = Board,
  _TChoiceType extends typeof CHOOSE_RETREAT_OPTION_CHOICE_TYPE =
    typeof CHOOSE_RETREAT_OPTION_CHOICE_TYPE,
> = TBoard extends StandardBoard
  ? StandardChooseRetreatOptionEvent
  : TBoard extends SmallBoard
    ? SmallChooseRetreatOptionEvent
    : TBoard extends LargeBoard
      ? LargeChooseRetreatOptionEvent
      : ChooseRetreatOptionEventUnion;

const _standardChooseRetreatOptionEventSchemaObject = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(CHOOSE_RETREAT_OPTION_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  retreatOption: standardUnitPlacementSchema,
});

type StandardChooseRetreatOptionEventSchemaType = z.infer<
  typeof _standardChooseRetreatOptionEventSchemaObject
>;

const _assertExactStandardChooseRetreatOptionEvent: AssertExact<
  StandardChooseRetreatOptionEvent,
  StandardChooseRetreatOptionEventSchemaType
> = true;

const _smallChooseRetreatOptionEventSchemaObject = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(CHOOSE_RETREAT_OPTION_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  retreatOption: smallUnitPlacementSchema,
});

type SmallChooseRetreatOptionEventSchemaType = z.infer<
  typeof _smallChooseRetreatOptionEventSchemaObject
>;

const _assertExactSmallChooseRetreatOptionEvent: AssertExact<
  SmallChooseRetreatOptionEvent,
  SmallChooseRetreatOptionEventSchemaType
> = true;

const _largeChooseRetreatOptionEventSchemaObject = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(CHOOSE_RETREAT_OPTION_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  retreatOption: largeUnitPlacementSchema,
});

type LargeChooseRetreatOptionEventSchemaType = z.infer<
  typeof _largeChooseRetreatOptionEventSchemaObject
>;

const _assertExactLargeChooseRetreatOptionEvent: AssertExact<
  LargeChooseRetreatOptionEvent,
  LargeChooseRetreatOptionEventSchemaType
> = true;

const _chooseRetreatOptionEventSchemaObject = z.union([
  _standardChooseRetreatOptionEventSchemaObject,
  _smallChooseRetreatOptionEventSchemaObject,
  _largeChooseRetreatOptionEventSchemaObject,
]);

type ChooseRetreatOptionEventSchemaType = z.infer<
  typeof _chooseRetreatOptionEventSchemaObject
>;

const _assertExactChooseRetreatOptionEvent: AssertExact<
  ChooseRetreatOptionEvent<Board>,
  ChooseRetreatOptionEventSchemaType
> = true;

/** The schema for a player choice to retreat. */
export const chooseRetreatOptionEventSchema: z.ZodType<
  ChooseRetreatOptionEvent<Board>
> = _chooseRetreatOptionEventSchemaObject;
