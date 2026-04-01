import type {
  Board,
  LargeBoard,
  LargeUnitPlacement,
  LargeUnitWithPlacement,
  PlayerSide,
  SmallBoard,
  SmallUnitPlacement,
  SmallUnitWithPlacement,
  StandardBoard,
  StandardUnitPlacement,
  StandardUnitWithPlacement,
} from '@entities';
import type { AssertExact } from '@utils';
import type { ZodDiscriminatedUnion } from 'zod';
import {
  largeUnitPlacementSchema,
  largeUnitWithPlacementSchema,
  playerSideSchema,
  smallUnitPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitPlacementSchema,
  standardUnitWithPlacementSchema,
} from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the move unit event. */
export const MOVE_UNIT_CHOICE_TYPE = 'moveUnit' as const;

interface MoveUnitEventBase {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof MOVE_UNIT_CHOICE_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is moving the unit. */
  player: PlayerSide;
  /** Whether to move the commander with the unit. */
  moveCommander: boolean;
}

/** Move unit on a standard board. */
export interface StandardMoveUnitEvent extends MoveUnitEventBase {
  boardType: 'standard';
  /** The unit to move. */
  unit: StandardUnitWithPlacement;
  /** The space the unit is moving to. */
  to: StandardUnitPlacement;
}

/** Move unit on a small board. */
export interface SmallMoveUnitEvent extends MoveUnitEventBase {
  boardType: 'small';
  unit: SmallUnitWithPlacement;
  to: SmallUnitPlacement;
}

/** Move unit on a large board. */
export interface LargeMoveUnitEvent extends MoveUnitEventBase {
  boardType: 'large';
  unit: LargeUnitWithPlacement;
  to: LargeUnitPlacement;
}

/** Move unit for any board size (discriminated on `boardType`). */
export type MoveUnitEventUnion =
  | StandardMoveUnitEvent
  | SmallMoveUnitEvent
  | LargeMoveUnitEvent;

export type MoveUnitEvent<
  TBoard extends Board = Board,
  _TChoiceType extends typeof MOVE_UNIT_CHOICE_TYPE =
    typeof MOVE_UNIT_CHOICE_TYPE,
> = TBoard extends StandardBoard
  ? StandardMoveUnitEvent
  : TBoard extends SmallBoard
    ? SmallMoveUnitEvent
    : TBoard extends LargeBoard
      ? LargeMoveUnitEvent
      : MoveUnitEventUnion;

// ---------------------------------------------------------------------------
// Per-variant Zod schemas
// ---------------------------------------------------------------------------

const _standardMoveUnitEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_UNIT_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<'standard'>;
  unit: typeof standardUnitWithPlacementSchema;
  to: typeof standardUnitPlacementSchema;
  moveCommander: z.ZodBoolean;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(MOVE_UNIT_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  unit: standardUnitWithPlacementSchema,
  to: standardUnitPlacementSchema,
  moveCommander: z.boolean(),
});

type StandardMoveUnitEventSchemaType = z.infer<
  typeof _standardMoveUnitEventSchemaObject
>;

const _assertExactStandardMoveUnitEvent: AssertExact<
  StandardMoveUnitEvent,
  StandardMoveUnitEventSchemaType
> = true;

const _smallMoveUnitEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_UNIT_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<'small'>;
  unit: typeof smallUnitWithPlacementSchema;
  to: typeof smallUnitPlacementSchema;
  moveCommander: z.ZodBoolean;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(MOVE_UNIT_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  unit: smallUnitWithPlacementSchema,
  to: smallUnitPlacementSchema,
  moveCommander: z.boolean(),
});

type SmallMoveUnitEventSchemaType = z.infer<
  typeof _smallMoveUnitEventSchemaObject
>;

const _assertExactSmallMoveUnitEvent: AssertExact<
  SmallMoveUnitEvent,
  SmallMoveUnitEventSchemaType
> = true;

const _largeMoveUnitEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_UNIT_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<'large'>;
  unit: typeof largeUnitWithPlacementSchema;
  to: typeof largeUnitPlacementSchema;
  moveCommander: z.ZodBoolean;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(MOVE_UNIT_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  unit: largeUnitWithPlacementSchema,
  to: largeUnitPlacementSchema,
  moveCommander: z.boolean(),
});

type LargeMoveUnitEventSchemaType = z.infer<
  typeof _largeMoveUnitEventSchemaObject
>;

const _assertExactLargeMoveUnitEvent: AssertExact<
  LargeMoveUnitEvent,
  LargeMoveUnitEventSchemaType
> = true;

// ---------------------------------------------------------------------------
// Wide union schema
// ---------------------------------------------------------------------------

type _MoveUnitEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof _standardMoveUnitEventSchemaObject,
    typeof _smallMoveUnitEventSchemaObject,
    typeof _largeMoveUnitEventSchemaObject,
  ],
  'boardType'
>;

const _moveUnitEventSchemaObject: _MoveUnitEventDiscriminatedUnion =
  z.discriminatedUnion('boardType', [
    _standardMoveUnitEventSchemaObject,
    _smallMoveUnitEventSchemaObject,
    _largeMoveUnitEventSchemaObject,
  ]);

type MoveUnitEventSchemaType = z.infer<typeof _moveUnitEventSchemaObject>;

const _assertExactMoveUnitEvent: AssertExact<
  MoveUnitEvent<Board>,
  MoveUnitEventSchemaType
> = true;

/** The schema for a move unit event. */
export const moveUnitEventSchema: typeof _moveUnitEventSchemaObject =
  _moveUnitEventSchemaObject;
