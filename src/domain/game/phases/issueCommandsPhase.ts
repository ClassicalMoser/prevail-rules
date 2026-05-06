import type {
  Board,
  Command,
  LargeBoard,
  SmallBoard,
  StandardBoard,
  UnitInstance,
} from "@entities";
import type { CommandResolutionStateForBoard } from "@game/substeps";
import type { AssertExact } from "@utils";
import { commandSchema, unitInstanceSchema } from "@entities";
import {
  largeCommandResolutionStateSchema,
  smallCommandResolutionStateSchema,
  standardCommandResolutionStateSchema,
} from "@game/substeps";
import { z } from "zod";

/** Iterable list of valid steps in the issue commands phase. */
export const issueCommandsPhaseSteps = [
  /** Complex step:Loop through remaining initiative player's commands
   * and expect issue commands events
   */
  "firstPlayerIssueCommands",
  /** Complex step: Loop through remaining initiative player's issued commands and expect resolve commands events
   * and expect resolve commands events (move or ranged attack)
   */
  "firstPlayerResolveCommands",
  /** Complex step: Loop through remaining non-initiative player's commands
   * and expect issue commands events
   */
  "secondPlayerIssueCommands",
  /** Complex step: Loop through remaining non-initiative player's issued commands
   * and expect resolve commands events (move or ranged attack)
   */
  "secondPlayerResolveCommands",
  /** Expect single gameEffect: advance phase to resolve melee phase */
  "complete", // GameEffect, advance phase to resolve melee phase
] as const;

/** The step of the issue commands phase. */
export type IssueCommandsPhaseStep = (typeof issueCommandsPhaseSteps)[number];

const _issueCommandsPhaseStepSchemaObject = z.enum(issueCommandsPhaseSteps);
type IssueCommandsPhaseStepSchemaType = z.infer<typeof _issueCommandsPhaseStepSchemaObject>;

const _assertExactIssueCommandsPhaseStep: AssertExact<
  IssueCommandsPhaseStep,
  IssueCommandsPhaseStepSchemaType
> = true;

/** The schema for the step of the issue commands phase. */
export const issueCommandsPhaseStepSchema: z.ZodType<IssueCommandsPhaseStep> =
  _issueCommandsPhaseStepSchemaObject;

/**
 * The state of the issue commands phase.
 *
 * Command resolution (movement / ranged attack) is board-correlated via
 * {@link CommandResolutionStateForBoard}; non-spatial fields are shared across boards.
 */
export interface IssueCommandsPhaseStateForBoard<TBoard extends Board> {
  /** The current phase of the round. */
  phase: "issueCommands";
  /** The step of the issue commands phase. */
  step: IssueCommandsPhaseStep;
  /** The board size. */
  boardType: TBoard["boardType"];
  /** The remaining commands for the first player. */
  remainingCommandsFirstPlayer: Set<Command>;
  /** remainingUnitsFirstPlayer */
  remainingUnitsFirstPlayer: Set<UnitInstance>;
  /** The remaining commands for the second player. */
  remainingCommandsSecondPlayer: Set<Command>;
  /** remainingUnitsSecondPlayer */
  remainingUnitsSecondPlayer: Set<UnitInstance>;
  /** The state of the ongoing command resolution (movement or ranged attack). */
  currentCommandResolutionState: CommandResolutionStateForBoard<TBoard> | undefined;
}

export type IssueCommandsPhaseState =
  | IssueCommandsPhaseStateForBoard<SmallBoard>
  | IssueCommandsPhaseStateForBoard<StandardBoard>
  | IssueCommandsPhaseStateForBoard<LargeBoard>;

const _smallIssueCommandsPhaseStateSchemaObject = z.object({
  /** The current phase of the round. */
  phase: z.literal("issueCommands"),
  /** The step of the issue commands phase. */
  step: _issueCommandsPhaseStepSchemaObject,
  /** The board size. */
  boardType: z.literal("small"),
  /** The remaining commands for the first player. */
  remainingCommandsFirstPlayer: z.set(commandSchema),
  /** remainingUnitsFirstPlayer */
  remainingUnitsFirstPlayer: z.set(unitInstanceSchema),
  /** The remaining commands for the second player. */
  remainingCommandsSecondPlayer: z.set(commandSchema),
  /** remainingUnitsSecondPlayer */
  remainingUnitsSecondPlayer: z.set(unitInstanceSchema),
  /** The state of the ongoing command resolution (movement or ranged attack). */
  currentCommandResolutionState: smallCommandResolutionStateSchema.or(z.undefined()),
});

type SmallIssueCommandsPhaseStateSchemaType = z.infer<
  typeof _smallIssueCommandsPhaseStateSchemaObject
>;
const _assertExactSmallIssueCommandsPhaseState: AssertExact<
  IssueCommandsPhaseStateForBoard<SmallBoard>,
  SmallIssueCommandsPhaseStateSchemaType
> = true;

export const smallIssueCommandsPhaseStateSchema: z.ZodType<
  IssueCommandsPhaseStateForBoard<SmallBoard>
> = _smallIssueCommandsPhaseStateSchemaObject as z.ZodType<
  IssueCommandsPhaseStateForBoard<SmallBoard>
>;

const _standardIssueCommandsPhaseStateSchemaObject = z.object({
  phase: z.literal("issueCommands"),
  step: _issueCommandsPhaseStepSchemaObject,
  boardType: z.literal("standard"),
  remainingCommandsFirstPlayer: z.set(commandSchema),
  remainingUnitsFirstPlayer: z.set(unitInstanceSchema),
  remainingCommandsSecondPlayer: z.set(commandSchema),
  remainingUnitsSecondPlayer: z.set(unitInstanceSchema),
  currentCommandResolutionState: standardCommandResolutionStateSchema.or(z.undefined()),
});

type StandardIssueCommandsPhaseStateSchemaType = z.infer<
  typeof _standardIssueCommandsPhaseStateSchemaObject
>;
const _assertExactStandardIssueCommandsPhaseState: AssertExact<
  IssueCommandsPhaseStateForBoard<StandardBoard>,
  StandardIssueCommandsPhaseStateSchemaType
> = true;

export const standardIssueCommandsPhaseStateSchema: z.ZodType<
  IssueCommandsPhaseStateForBoard<StandardBoard>
> = _standardIssueCommandsPhaseStateSchemaObject as z.ZodType<
  IssueCommandsPhaseStateForBoard<StandardBoard>
>;

const _largeIssueCommandsPhaseStateSchemaObject = z.object({
  phase: z.literal("issueCommands"),
  step: _issueCommandsPhaseStepSchemaObject,
  boardType: z.literal("large"),
  remainingCommandsFirstPlayer: z.set(commandSchema),
  remainingUnitsFirstPlayer: z.set(unitInstanceSchema),
  remainingCommandsSecondPlayer: z.set(commandSchema),
  remainingUnitsSecondPlayer: z.set(unitInstanceSchema),
  currentCommandResolutionState: largeCommandResolutionStateSchema.or(z.undefined()),
});

type LargeIssueCommandsPhaseStateSchemaType = z.infer<
  typeof _largeIssueCommandsPhaseStateSchemaObject
>;
const _assertExactLargeIssueCommandsPhaseState: AssertExact<
  IssueCommandsPhaseStateForBoard<LargeBoard>,
  LargeIssueCommandsPhaseStateSchemaType
> = true;

export const largeIssueCommandsPhaseStateSchema: z.ZodType<
  IssueCommandsPhaseStateForBoard<LargeBoard>
> = _largeIssueCommandsPhaseStateSchemaObject as z.ZodType<
  IssueCommandsPhaseStateForBoard<LargeBoard>
>;

const _issueCommandsPhaseStateSchemaObject = z.union([
  _smallIssueCommandsPhaseStateSchemaObject,
  _standardIssueCommandsPhaseStateSchemaObject,
  _largeIssueCommandsPhaseStateSchemaObject,
]);

/** Schema for issue-commands phase state (any board). Per-variant AssertExact above. */
export const issueCommandsPhaseStateSchema: z.ZodType<IssueCommandsPhaseState> =
  _issueCommandsPhaseStateSchemaObject as z.ZodType<IssueCommandsPhaseState>;
