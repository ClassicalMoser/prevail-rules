import type {
  Board,
  LargeBoard,
  LargeBoardCoordinate,
  PlayerSide,
  SmallBoard,
  SmallBoardCoordinate,
  StandardBoard,
  StandardBoardCoordinate,
} from '@entities';
import type { AssertExact } from '@utils';
import {
  largeBoardCoordinateSchema,
  playerSideSchema,
  smallBoardCoordinateSchema,
  standardBoardCoordinateSchema,
} from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the choose melee resolution event. */
export const CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE =
  'chooseMeleeResolution' as const;

interface ChooseMeleeResolutionEventBase {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is choosing the melee resolution. */
  player: PlayerSide;
}

export interface StandardChooseMeleeResolutionEvent extends ChooseMeleeResolutionEventBase {
  boardType: 'standard';
  /** The space the melee is occurring in. */
  space: StandardBoardCoordinate;
}

export interface SmallChooseMeleeResolutionEvent extends ChooseMeleeResolutionEventBase {
  boardType: 'small';
  space: SmallBoardCoordinate;
}

export interface LargeChooseMeleeResolutionEvent extends ChooseMeleeResolutionEventBase {
  boardType: 'large';
  space: LargeBoardCoordinate;
}

export type ChooseMeleeResolutionEventUnion =
  | StandardChooseMeleeResolutionEvent
  | SmallChooseMeleeResolutionEvent
  | LargeChooseMeleeResolutionEvent;

export type ChooseMeleeResolutionEvent<
  TBoard extends Board = Board,
  _TChoiceType extends typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE =
    typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE,
> = TBoard extends StandardBoard
  ? StandardChooseMeleeResolutionEvent
  : TBoard extends SmallBoard
    ? SmallChooseMeleeResolutionEvent
    : TBoard extends LargeBoard
      ? LargeChooseMeleeResolutionEvent
      : ChooseMeleeResolutionEventUnion;

const _standardChooseMeleeResolutionEventSchemaObject = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  space: standardBoardCoordinateSchema,
});

type StandardChooseMeleeResolutionEventSchemaType = z.infer<
  typeof _standardChooseMeleeResolutionEventSchemaObject
>;

const _assertExactStandardChooseMeleeResolutionEvent: AssertExact<
  StandardChooseMeleeResolutionEvent,
  StandardChooseMeleeResolutionEventSchemaType
> = true;

const _smallChooseMeleeResolutionEventSchemaObject = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  space: smallBoardCoordinateSchema,
});

type SmallChooseMeleeResolutionEventSchemaType = z.infer<
  typeof _smallChooseMeleeResolutionEventSchemaObject
>;

const _assertExactSmallChooseMeleeResolutionEvent: AssertExact<
  SmallChooseMeleeResolutionEvent,
  SmallChooseMeleeResolutionEventSchemaType
> = true;

const _largeChooseMeleeResolutionEventSchemaObject = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  space: largeBoardCoordinateSchema,
});

type LargeChooseMeleeResolutionEventSchemaType = z.infer<
  typeof _largeChooseMeleeResolutionEventSchemaObject
>;

const _assertExactLargeChooseMeleeResolutionEvent: AssertExact<
  LargeChooseMeleeResolutionEvent,
  LargeChooseMeleeResolutionEventSchemaType
> = true;

const _chooseMeleeResolutionEventSchemaObject = z.union([
  _standardChooseMeleeResolutionEventSchemaObject,
  _smallChooseMeleeResolutionEventSchemaObject,
  _largeChooseMeleeResolutionEventSchemaObject,
]);

type ChooseMeleeResolutionEventSchemaType = z.infer<
  typeof _chooseMeleeResolutionEventSchemaObject
>;

const _assertExactChooseMeleeResolutionEvent: AssertExact<
  ChooseMeleeResolutionEvent<Board>,
  ChooseMeleeResolutionEventSchemaType
> = true;

/** The schema for a choose melee resolution event. */
export const chooseMeleeResolutionEventSchema: z.ZodType<
  ChooseMeleeResolutionEvent<Board>
> = _chooseMeleeResolutionEventSchemaObject;
