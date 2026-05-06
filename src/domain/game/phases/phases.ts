import type { AssertExact } from "@utils";
import type { CleanupPhaseState } from "./cleanupPhase";
import type { IssueCommandsPhaseStateForBoard } from "./issueCommandsPhase";
import type { MoveCommandersPhaseState } from "./moveCommandersPhase";
import type { PlayCardsPhaseState } from "./playCardsPhase";

import type { ResolveMeleePhaseStateForBoard } from "./resolveMeleePhase";
import { z } from "zod";
import { cleanupPhaseStateSchema } from "./cleanupPhase";
import {
  largeIssueCommandsPhaseStateSchema,
  smallIssueCommandsPhaseStateSchema,
  standardIssueCommandsPhaseStateSchema,
} from "./issueCommandsPhase";
import { moveCommandersPhaseStateSchema } from "./moveCommandersPhase";
import { playCardsPhaseStateSchema } from "./playCardsPhase";
import {
  largeResolveMeleePhaseStateSchema,
  smallResolveMeleePhaseStateSchema,
  standardResolveMeleePhaseStateSchema,
} from "./resolveMeleePhase";
import { Board, LargeBoard, SmallBoard, StandardBoard } from "@entities";

/**
 * Iterable list of valid phases for a round.
 */
export const phases = [
  "playCards",
  "moveCommanders",
  "issueCommands",
  "resolveMelee",
  "cleanup",
] as const;

/**
 * The type of a phase of a round.
 */
export type Phase = (typeof phases)[number];

/** The play cards phase. */
export const PLAY_CARDS_PHASE: "playCards" = phases[0];

/** The move commanders phase. */
export const MOVE_COMMANDERS_PHASE: "moveCommanders" = phases[1];

/** The issue commands phase. */
export const ISSUE_COMMANDS_PHASE: "issueCommands" = phases[2];

/** The resolve melee phase. */
export const RESOLVE_MELEE_PHASE: "resolveMelee" = phases[3];

/** The cleanup phase. */
export const CLEANUP_PHASE: "cleanup" = phases[4];

const _phaseSchemaObject = z.enum(phases);
type PhaseSchemaType = z.infer<typeof _phaseSchemaObject>;

/**
 * The schema for a phase of a round.
 */
export const phaseSchema: z.ZodType<Phase> = _phaseSchemaObject;

// Verify manual type matches schema inference
const _assertExactPhase: AssertExact<Phase, PhaseSchemaType> = true;

/**
 * The state of a phase of a round.
 *
 * Spatial branches (`issueCommands`, `resolveMelee`) correlate nested state with `TBoard`.
 */
export type PhaseStateForBoard<TBoard extends Board> =
  | PlayCardsPhaseState
  | MoveCommandersPhaseState
  | IssueCommandsPhaseStateForBoard<TBoard>
  | ResolveMeleePhaseStateForBoard<TBoard>
  | CleanupPhaseState;

export type PhaseState =
  | PhaseStateForBoard<SmallBoard>
  | PhaseStateForBoard<StandardBoard>
  | PhaseStateForBoard<LargeBoard>;

/** Zod 4: phase branches include nested board unions; use flat union, not nested discriminatedUnion. */
const _smallPhaseStateSchemaObject = z.union([
  playCardsPhaseStateSchema,
  moveCommandersPhaseStateSchema,
  smallIssueCommandsPhaseStateSchema,
  smallResolveMeleePhaseStateSchema,
  cleanupPhaseStateSchema,
]);

type SmallPhaseStateSchemaType = z.infer<typeof _smallPhaseStateSchemaObject>;
const _assertExactSmallPhaseState: AssertExact<
  PhaseStateForBoard<SmallBoard>,
  SmallPhaseStateSchemaType
> = true;

export const smallPhaseStateSchema: z.ZodType<PhaseStateForBoard<SmallBoard>> =
  _smallPhaseStateSchemaObject;

const _standardPhaseStateSchemaObject = z.union([
  playCardsPhaseStateSchema,
  moveCommandersPhaseStateSchema,
  standardIssueCommandsPhaseStateSchema,
  standardResolveMeleePhaseStateSchema,
  cleanupPhaseStateSchema,
]);

type StandardPhaseStateSchemaType = z.infer<typeof _standardPhaseStateSchemaObject>;
const _assertExactStandardPhaseState: AssertExact<
  PhaseStateForBoard<StandardBoard>,
  StandardPhaseStateSchemaType
> = true;

export const standardPhaseStateSchema: z.ZodType<PhaseStateForBoard<StandardBoard>> =
  _standardPhaseStateSchemaObject;

const _largePhaseStateSchemaObject = z.union([
  playCardsPhaseStateSchema,
  moveCommandersPhaseStateSchema,
  largeIssueCommandsPhaseStateSchema,
  largeResolveMeleePhaseStateSchema,
  cleanupPhaseStateSchema,
]);

type LargePhaseStateSchemaType = z.infer<typeof _largePhaseStateSchemaObject>;
const _assertExactLargePhaseState: AssertExact<
  PhaseStateForBoard<LargeBoard>,
  LargePhaseStateSchemaType
> = true;

export const largePhaseStateSchema: z.ZodType<PhaseStateForBoard<LargeBoard>> =
  _largePhaseStateSchemaObject;

/** The schema for the state of a phase of a round. */
export const phaseStateSchema: z.ZodType<PhaseState> = z.union([
  _smallPhaseStateSchemaObject,
  _standardPhaseStateSchemaObject,
  _largePhaseStateSchemaObject,
]);
