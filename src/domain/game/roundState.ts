import type { Board, UnitInstance } from "@entities";
import type { PhaseStateForBoard } from "./phases";
import type { EventForBoard } from "@events";

import { largePhaseStateSchema, smallPhaseStateSchema, standardPhaseStateSchema } from "./phases";
import { LargeBoard, SmallBoard, StandardBoard, unitInstanceSchema } from "@entities";
import { largeEventSchema, smallEventSchema, standardEventSchema } from "@events";
import { z } from "zod";

import type { AssertExact } from "@utils";

/**
 * The state of a round of the game.
 *
 * Event stream is stored per round and is narrowed to the board type in the game state.
 */
export interface RoundStateForBoard<TBoard extends Board> {
  /** The number of the round. */
  roundNumber: number;
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The phases that have been completed in the round. */
  completedPhases: Set<PhaseStateForBoard<TBoard>>;
  /** The state of the current phase of the round. */
  currentPhaseState: PhaseStateForBoard<TBoard> | undefined;
  /** Units that have been commanded this round. */
  commandedUnits: Set<UnitInstance>;
  /** Events applied during this round, in order. */
  events: readonly EventForBoard<TBoard>[];
}

export type RoundState =
  | RoundStateForBoard<SmallBoard>
  | RoundStateForBoard<StandardBoard>
  | RoundStateForBoard<LargeBoard>;

const _smallRoundStateSchemaObject = z.object({
  /** The number of the round. */
  roundNumber: z.int().positive(),
  /** The type of the board. */
  boardType: z.literal("small"),
  /** The phases that have been completed in the round. */
  completedPhases: z.set(smallPhaseStateSchema),
  /** The state of the current phase of the round. */
  currentPhaseState: smallPhaseStateSchema.or(z.undefined()),
  /** Units that have been commanded this round. */
  commandedUnits: z.set(unitInstanceSchema),
  /** Events applied during this round, in order. */
  events: z.array(smallEventSchema).readonly(),
});

type SmallRoundStateSchemaType = z.infer<typeof _smallRoundStateSchemaObject>;

const _assertExactSmallRoundState: AssertExact<
  RoundStateForBoard<SmallBoard>,
  SmallRoundStateSchemaType
> = true;

export const smallRoundStateSchema: z.ZodType<RoundStateForBoard<SmallBoard>> =
  _smallRoundStateSchemaObject;

const _standardRoundStateSchemaObject = z.object({
  /** The number of the round. */
  roundNumber: z.int().positive(),
  /** The type of the board. */
  boardType: z.literal("standard"),
  /** The phases that have been completed in the round. */
  completedPhases: z.set(standardPhaseStateSchema),
  /** The state of the current phase of the round. */
  currentPhaseState: standardPhaseStateSchema.or(z.undefined()),
  /** Units that have been commanded this round. */
  commandedUnits: z.set(unitInstanceSchema),
  /** Events applied during this round, in order. */
  events: z.array(standardEventSchema).readonly(),
});

type StandardRoundStateSchemaType = z.infer<typeof _standardRoundStateSchemaObject>;

const _assertExactStandardRoundState: AssertExact<
  RoundStateForBoard<StandardBoard>,
  StandardRoundStateSchemaType
> = true;

export const standardRoundStateSchema: z.ZodType<RoundStateForBoard<StandardBoard>> =
  _standardRoundStateSchemaObject;

const _largeRoundStateSchemaObject = z.object({
  /** The number of the round. */
  roundNumber: z.int().positive(),
  /** The type of the board. */
  boardType: z.literal("large"),
  /** The phases that have been completed in the round. */
  completedPhases: z.set(largePhaseStateSchema),
  /** The state of the current phase of the round. */
  currentPhaseState: largePhaseStateSchema.or(z.undefined()),
  /** Units that have been commanded this round. */
  commandedUnits: z.set(unitInstanceSchema),
  /** Events applied during this round, in order. */
  events: z.array(largeEventSchema).readonly(),
});

type LargeRoundStateSchemaType = z.infer<typeof _largeRoundStateSchemaObject>;

const _assertExactLargeRoundState: AssertExact<
  RoundStateForBoard<LargeBoard>,
  LargeRoundStateSchemaType
> = true;

export const largeRoundStateSchema: z.ZodType<RoundStateForBoard<LargeBoard>> =
  _largeRoundStateSchemaObject;

const _roundStateSchemaObject = z.discriminatedUnion("boardType", [
  _smallRoundStateSchemaObject,
  _standardRoundStateSchemaObject,
  _largeRoundStateSchemaObject,
]);

type RoundStateSchemaType = z.infer<typeof _roundStateSchemaObject>;

const _assertExactRoundState: AssertExact<RoundState, RoundStateSchemaType> = true;

export const roundStateSchema: z.ZodType<RoundState> = _roundStateSchemaObject;
