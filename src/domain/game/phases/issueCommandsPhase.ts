import type { Command, UnitInstance } from '@entities';
import type { CommandResolutionState } from '@game/substeps';
import type { AssertExact } from '@utils';
import { commandSchema, unitInstanceSchema } from '@entities';
import { commandResolutionStateSchema } from '@game/substeps';
import { z } from 'zod';

/** Iterable list of valid steps in the issue commands phase. */
export const issueCommandsPhaseSteps = [
  /** Complex step:Loop through remaining initiative player's commands
   * and expect issue commands events
   */
  'firstPlayerIssueCommands',
  /** Complex step: Loop through remaining initiative player's issued commands and expect resolve commands events
   * and expect resolve commands events (move or ranged attack)
   */
  'firstPlayerResolveCommands',
  /** Complex step: Loop through remaining non-initiative player's commands
   * and expect issue commands events
   */
  'secondPlayerIssueCommands',
  /** Complex step: Loop through remaining non-initiative player's issued commands
   * and expect resolve commands events (move or ranged attack)
   */
  'secondPlayerResolveCommands',
  /** Expect single gameEffect: advance phase to resolve melee phase */
  'complete', // GameEffect, advance phase to resolve melee phase
] as const;

/** The step of the issue commands phase. */
export type IssueCommandsPhaseStep = (typeof issueCommandsPhaseSteps)[number];

const _issueCommandsPhaseStepSchemaObject = z.enum(issueCommandsPhaseSteps);
type IssueCommandsPhaseStepSchemaType = z.infer<
  typeof _issueCommandsPhaseStepSchemaObject
>;

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
 * Board-sized data lives in {@link CommandResolutionState} and `GameState.boardState`, not here;
 * this envelope is board-agnostic (Layer 4 pass-through hygiene).
 */
export interface IssueCommandsPhaseState {
  /** The current phase of the round. */
  phase: 'issueCommands';
  /** The step of the issue commands phase. */
  step: IssueCommandsPhaseStep;
  /** The remaining commands for the first player. */
  remainingCommandsFirstPlayer: Set<Command>;
  /** remainingUnitsFirstPlayer */
  remainingUnitsFirstPlayer: Set<UnitInstance>;
  /** The remaining commands for the second player. */
  remainingCommandsSecondPlayer: Set<Command>;
  /** remainingUnitsSecondPlayer */
  remainingUnitsSecondPlayer: Set<UnitInstance>;
  /** The state of the ongoing command resolution (movement or ranged attack). */
  currentCommandResolutionState: CommandResolutionState | undefined;
}

const _issueCommandsPhaseStateSchemaObject = z.object({
  /** The current phase of the round. */
  phase: z.literal('issueCommands'),
  /** The step of the issue commands phase. */
  step: issueCommandsPhaseStepSchema,
  /** The remaining commands for the first player. */
  remainingCommandsFirstPlayer: z.set(commandSchema),
  /** remainingUnitsFirstPlayer */
  remainingUnitsFirstPlayer: z.set(unitInstanceSchema),
  /** The remaining commands for the second player. */
  remainingCommandsSecondPlayer: z.set(commandSchema),
  /** remainingUnitsSecondPlayer */
  remainingUnitsSecondPlayer: z.set(unitInstanceSchema),
  /** The state of the ongoing command resolution (movement or ranged attack). */
  currentCommandResolutionState: commandResolutionStateSchema.or(z.undefined()),
});

// Verify manual type matches schema inference
type IssueCommandsPhaseStateSchemaType = z.infer<
  typeof _issueCommandsPhaseStateSchemaObject
>;
const _assertExactIssueCommandsPhaseState: AssertExact<
  IssueCommandsPhaseState,
  IssueCommandsPhaseStateSchemaType
> = true;

/** The schema for the state of the issue commands phase. */
export const issueCommandsPhaseStateSchema: z.ZodObject<{
  phase: z.ZodLiteral<'issueCommands'>;
  step: z.ZodType<IssueCommandsPhaseStep>;
  remainingCommandsFirstPlayer: z.ZodSet<z.ZodType<Command>>;
  remainingUnitsFirstPlayer: z.ZodSet<z.ZodType<UnitInstance>>;
  remainingCommandsSecondPlayer: z.ZodSet<z.ZodType<Command>>;
  remainingUnitsSecondPlayer: z.ZodSet<z.ZodType<UnitInstance>>;
  currentCommandResolutionState: z.ZodType<CommandResolutionState | undefined>;
}> = _issueCommandsPhaseStateSchemaObject;
