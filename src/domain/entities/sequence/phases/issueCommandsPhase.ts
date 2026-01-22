import type { Board } from '@entities/board';
import type { Command } from '@entities/card';
import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import type { CommandResolutionState } from '../substeps';
import { commandSchema } from '@entities/card';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';
import { commandResolutionStateSchema } from '../substeps';
import { ISSUE_COMMANDS_PHASE } from './phases';

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

/** The state of the issue commands phase. */
export interface IssueCommandsPhaseState<TBoard extends Board> {
  /** The current phase of the round. */
  phase: typeof ISSUE_COMMANDS_PHASE;
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
  currentCommandResolutionState: CommandResolutionState<TBoard> | undefined;
}

const _issueCommandsPhaseStateSchemaObject = z.object({
  /** The current phase of the round. */
  phase: z.literal(ISSUE_COMMANDS_PHASE),
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
  IssueCommandsPhaseState<Board>,
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
  currentCommandResolutionState: z.ZodType<
    CommandResolutionState<Board> | undefined
  >;
}> = _issueCommandsPhaseStateSchemaObject;
