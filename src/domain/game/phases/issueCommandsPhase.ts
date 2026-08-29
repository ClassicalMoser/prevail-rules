import type { Command, UnitInstance } from '@entities';
import type { CommandResolutionState } from '@game/substeps';
import type { AssertExact } from '@utils';
import { commandSchema, unitInstanceSchema } from '@entities';
import { z } from 'zod';
import { commandResolutionStateSchema } from '../substeps/commandResolutionState';

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
 * Command resolution (movement / ranged attack) is board-correlated via
 * {@link CommandResolutionState}; non-spatial fields are shared across boards.
 */
export interface IssueCommandsPhaseState {
  /** The current phase of the round. */
  phase: 'issueCommands';
  /** The step of the issue commands phase. */
  step: IssueCommandsPhaseStep;
  /** The remaining commands for the first player. */
  remainingCommandsFirstPlayer: Command[];
  /** RemainingUnitsFirstPlayer */
  remainingUnitsFirstPlayer: UnitInstance[];
  /** The remaining commands for the second player. */
  remainingCommandsSecondPlayer: Command[];
  /** RemainingUnitsSecondPlayer */
  remainingUnitsSecondPlayer: UnitInstance[];
  /** The state of the ongoing command resolution (movement or ranged attack). */
  currentCommandResolutionState: CommandResolutionState | 'pending';
}

const _issueCommandsPhaseStateSchemaObject = z
  .object({
    phase: z.literal('issueCommands'),
    step: _issueCommandsPhaseStepSchemaObject,
    remainingCommandsFirstPlayer: z.array(commandSchema),
    remainingUnitsFirstPlayer: z.array(unitInstanceSchema),
    remainingCommandsSecondPlayer: z.array(commandSchema),
    remainingUnitsSecondPlayer: z.array(unitInstanceSchema),
    currentCommandResolutionState: commandResolutionStateSchema.or(
      z.literal('pending'),
    ),
  })
  .strict();

type IssueCommandsPhaseStateSchemaType = z.infer<
  typeof _issueCommandsPhaseStateSchemaObject
>;
const _assertExactIssueCommandsPhaseState: AssertExact<
  IssueCommandsPhaseState,
  IssueCommandsPhaseStateSchemaType
> = true;

export const issueCommandsPhaseStateSchema: z.ZodType<IssueCommandsPhaseState> =
  _issueCommandsPhaseStateSchemaObject;
