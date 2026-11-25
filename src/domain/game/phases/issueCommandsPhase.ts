import type { UnitInstance } from '@entities';
import type { CommandResolutionState } from '@game/substeps';
import type { AssertExact } from '@utils';

import { unitInstanceSchema } from '@entities';
import { z } from 'zod';
import { commandResolutionStateSchema } from '../substeps/commandResolution';

/** Iterable list of valid steps in the issue commands phase. */
export const issueCommandsPhaseSteps = [
  // The first player spends their card's command on the units it orders
  // (§4.3.1).
  'firstPlayerIssueCommands',
  // Then carries out every order they gave, one unit at a time: each a move
  // or a shot, and whatever it sets off.
  'firstPlayerResolveCommands',
  // The second player issues theirs.
  'secondPlayerIssueCommands',
  // And carries them out the same way.
  'secondPlayerResolveCommands',
  // The phase ends, and the melees are fought next.
  'complete',
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
  /** The remaining units available to the first player's commands. */
  remainingUnitsFirstPlayer: UnitInstance[];
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
    /** The remaining units available to the first player's commands. */
    remainingUnitsFirstPlayer: z.array(unitInstanceSchema),
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
export const issueCommandsPhaseStateSchema: z.ZodObject<{
  phase: z.ZodLiteral<'issueCommands'>;
  step: z.ZodType<IssueCommandsPhaseStep>;
  remainingUnitsFirstPlayer: z.ZodArray<z.ZodType<UnitInstance>>;
  remainingUnitsSecondPlayer: z.ZodArray<z.ZodType<UnitInstance>>;
  currentCommandResolutionState: z.ZodType<CommandResolutionState | 'pending'>;
}> = _issueCommandsPhaseStateSchemaObject;

const _assertExactIssueCommandsPhaseState: AssertExact<
  IssueCommandsPhaseState,
  IssueCommandsPhaseStateSchemaType
> = true;
