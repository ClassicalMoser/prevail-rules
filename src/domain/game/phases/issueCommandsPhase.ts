import type { Command, UnitInstance } from '@entities';
import type { CommandResolutionState } from '@game/substeps';
import type { AssertExact } from '@utils';

import { commandSchema, unitInstanceSchema } from '@entities';
import { z } from 'zod';
import { commandResolutionStateSchema } from '../substeps/commandResolution';

/** Iterable list of valid steps in the issue commands phase. */
export const issueCommandsPhaseSteps = [
  'firstPlayerIssueCommands', // Loop: expect issue-command choices for the initiative player's remaining commands
  'firstPlayerResolveCommands', // Loop: expect resolve events (move or ranged attack) for the initiative player's issued commands
  'secondPlayerIssueCommands', // Loop: expect issue-command choices for the non-initiative player's remaining commands
  'secondPlayerResolveCommands', // Loop: expect resolve events (move or ranged attack) for the non-initiative player's issued commands
  'complete', // Expect one gameEffect: advance to resolve melee phase
] as const;

/** The type of a step in the issue commands phase. */
export type IssueCommandsPhaseStep = (typeof issueCommandsPhaseSteps)[number];

/** The schema for a step in the issue commands phase. */
export const issueCommandsPhaseStepSchema: z.ZodType<IssueCommandsPhaseStep> =
  z.enum(issueCommandsPhaseSteps);

/**
 * The state of the issue commands phase.
 *
 * Command resolution (movement / ranged attack) nests under
 * {@link CommandResolutionState} while a command is in flight.
 */
export interface IssueCommandsPhaseState {
  /** The current phase of the round. */
  phase: 'issueCommands';
  /** The step of the issue commands phase. */
  step: IssueCommandsPhaseStep;
  /** The remaining commands for the first player. */
  remainingCommandsFirstPlayer: Command[];
  /** The remaining units available to the first player's commands. */
  remainingUnitsFirstPlayer: UnitInstance[];
  /** The remaining commands for the second player. */
  remainingCommandsSecondPlayer: Command[];
  /** The remaining units available to the second player's commands. */
  remainingUnitsSecondPlayer: UnitInstance[];
  /** The state of the ongoing command resolution (movement or ranged attack). */
  currentCommandResolutionState: CommandResolutionState | 'pending';
}

const _issueCommandsPhaseStateSchemaObject = z
  .object({
    /** The current phase of the round. */
    phase: z.literal('issueCommands'),
    /** The step of the issue commands phase. */
    step: issueCommandsPhaseStepSchema,
    /** The remaining commands for the first player. */
    remainingCommandsFirstPlayer: z.array(commandSchema),
    /** The remaining units available to the first player's commands. */
    remainingUnitsFirstPlayer: z.array(unitInstanceSchema),
    /** The remaining commands for the second player. */
    remainingCommandsSecondPlayer: z.array(commandSchema),
    /** The remaining units available to the second player's commands. */
    remainingUnitsSecondPlayer: z.array(unitInstanceSchema),
    /** The state of the ongoing command resolution (movement or ranged attack). */
    currentCommandResolutionState: commandResolutionStateSchema.or(
      z.literal('pending'),
    ),
  })
  .strict();

type IssueCommandsPhaseStateSchemaType = z.infer<
  typeof _issueCommandsPhaseStateSchemaObject
>;

/** The schema for the state of the issue commands phase. */
export const issueCommandsPhaseStateSchema: z.ZodType<IssueCommandsPhaseState> =
  _issueCommandsPhaseStateSchemaObject;

const _assertExactIssueCommandsPhaseState: AssertExact<
  IssueCommandsPhaseState,
  IssueCommandsPhaseStateSchemaType
> = true;
