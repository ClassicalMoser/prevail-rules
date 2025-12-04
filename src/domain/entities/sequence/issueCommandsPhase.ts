import type { Command } from '@entities';
import type { AssertExact } from '@utils';
import { commandSchema } from '@entities';
import { z } from 'zod';
import { ISSUE_COMMANDS_PHASE } from './phases';

/** Iterable list of valid steps in the issue commands phase. */
export const issueCommandsPhaseSteps = [
  'firstPlayerIssueCommands',
  'firstPlayerResolveCommands',
  'secondPlayerIssueCommands',
  'secondPlayerResolveCommands',
  'complete',
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
export interface IssueCommandsPhaseState {
  /** The current phase of the round. */
  phase: typeof ISSUE_COMMANDS_PHASE;
  /** The step of the issue commands phase. */
  step: IssueCommandsPhaseStep;
  /** The remaining commands for the first player. */
  remainingCommandsFirstPlayer: Set<Command>;
  /** The remaining commands for the second player. */
  remainingCommandsSecondPlayer: Set<Command>;
}

const _issueCommandsPhaseStateSchemaObject = z.object({
  /** The current phase of the round. */
  phase: z.literal(ISSUE_COMMANDS_PHASE),
  /** The step of the issue commands phase. */
  step: issueCommandsPhaseStepSchema,
  /** The remaining commands for the first player. */
  remainingCommandsFirstPlayer: z.set(commandSchema),
  /** The remaining commands for the second player. */
  remainingCommandsSecondPlayer: z.set(commandSchema),
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
  remainingCommandsSecondPlayer: z.ZodSet<z.ZodType<Command>>;
}> = _issueCommandsPhaseStateSchemaObject;
