import type {
  Board,
  LargeBoard,
  LargeBoardCoordinate,
  SmallBoard,
  SmallBoardCoordinate,
  StandardBoard,
  StandardBoardCoordinate,
} from '@entities';
import type { AssertExact } from '@utils';
import {
  largeBoardCoordinateSchema,
  smallBoardCoordinateSchema,
  standardBoardCoordinateSchema,
} from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/**
 * Literal discriminator for {@link CompleteIssueCommandsPhaseEvent.effectType}.
 *
 * Phase transition: issue commands → resolve melee. `remainingEngagements` is a board-derived
 * snapshot so apply does not scan for engaged coordinates at transition time.
 */
export const COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE =
  'completeIssueCommandsPhase' as const;

interface CompleteIssueCommandsPhaseEventBase {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

/** Event to complete the issue commands phase and advance to resolve melee phase. */
export interface StandardCompleteIssueCommandsPhaseEvent extends CompleteIssueCommandsPhaseEventBase {
  boardType: 'standard';
  /**
   * Board coordinates with engaged units to resolve in the resolve-melee phase.
   * Produced by the procedure from the board at transition time; apply trusts the log.
   */
  remainingEngagements: Set<StandardBoardCoordinate>;
}

export interface SmallCompleteIssueCommandsPhaseEvent extends CompleteIssueCommandsPhaseEventBase {
  boardType: 'small';
  remainingEngagements: Set<SmallBoardCoordinate>;
}

export interface LargeCompleteIssueCommandsPhaseEvent extends CompleteIssueCommandsPhaseEventBase {
  boardType: 'large';
  remainingEngagements: Set<LargeBoardCoordinate>;
}

export type CompleteIssueCommandsPhaseEventUnion =
  | StandardCompleteIssueCommandsPhaseEvent
  | SmallCompleteIssueCommandsPhaseEvent
  | LargeCompleteIssueCommandsPhaseEvent;

export type CompleteIssueCommandsPhaseEvent<
  TBoard extends Board = Board,
  _TEffectType extends typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE =
    typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
> = TBoard extends StandardBoard
  ? StandardCompleteIssueCommandsPhaseEvent
  : TBoard extends SmallBoard
    ? SmallCompleteIssueCommandsPhaseEvent
    : TBoard extends LargeBoard
      ? LargeCompleteIssueCommandsPhaseEvent
      : CompleteIssueCommandsPhaseEventUnion;

const _standardCompleteIssueCommandsPhaseEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  remainingEngagements: z.set(standardBoardCoordinateSchema),
});

type StandardCompleteIssueCommandsPhaseEventSchemaType = z.infer<
  typeof _standardCompleteIssueCommandsPhaseEventSchemaObject
>;

const _assertExactStandardCompleteIssueCommandsPhaseEvent: AssertExact<
  StandardCompleteIssueCommandsPhaseEvent,
  StandardCompleteIssueCommandsPhaseEventSchemaType
> = true;

const _smallCompleteIssueCommandsPhaseEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  remainingEngagements: z.set(smallBoardCoordinateSchema),
});

type SmallCompleteIssueCommandsPhaseEventSchemaType = z.infer<
  typeof _smallCompleteIssueCommandsPhaseEventSchemaObject
>;

const _assertExactSmallCompleteIssueCommandsPhaseEvent: AssertExact<
  SmallCompleteIssueCommandsPhaseEvent,
  SmallCompleteIssueCommandsPhaseEventSchemaType
> = true;

const _largeCompleteIssueCommandsPhaseEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  remainingEngagements: z.set(largeBoardCoordinateSchema),
});

type LargeCompleteIssueCommandsPhaseEventSchemaType = z.infer<
  typeof _largeCompleteIssueCommandsPhaseEventSchemaObject
>;

const _assertExactLargeCompleteIssueCommandsPhaseEvent: AssertExact<
  LargeCompleteIssueCommandsPhaseEvent,
  LargeCompleteIssueCommandsPhaseEventSchemaType
> = true;

const _completeIssueCommandsPhaseEventSchemaObject = z.union([
  _standardCompleteIssueCommandsPhaseEventSchemaObject,
  _smallCompleteIssueCommandsPhaseEventSchemaObject,
  _largeCompleteIssueCommandsPhaseEventSchemaObject,
]);

type CompleteIssueCommandsPhaseEventSchemaType = z.infer<
  typeof _completeIssueCommandsPhaseEventSchemaObject
>;

const _assertExactCompleteIssueCommandsPhaseEvent: AssertExact<
  CompleteIssueCommandsPhaseEvent<Board>,
  CompleteIssueCommandsPhaseEventSchemaType
> = true;

/** The schema for a complete issue commands phase event. */
export const completeIssueCommandsPhaseEventSchema: z.ZodType<
  CompleteIssueCommandsPhaseEvent<Board>
> = _completeIssueCommandsPhaseEventSchemaObject;
