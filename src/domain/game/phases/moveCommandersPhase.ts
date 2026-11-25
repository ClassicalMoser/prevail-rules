import type { AssertExact } from '@utils';

import { z } from 'zod';

/** Iterable list of valid steps in the move commanders phase. */
export const moveCommandersPhaseSteps = [
  // The first player moves their commander, or leaves it where it is
  // (§4.2.1, §4.2.6).
  'moveFirstCommander',
  // Then the second player moves theirs.
  'moveSecondCommander',
  // The phase ends, and commands are issued next.
  'complete',
] as const;

/** The type of a step in the move commanders phase. */
export type MoveCommandersPhaseStep = (typeof moveCommandersPhaseSteps)[number];

/** The schema for a step in the move commanders phase. */
export const moveCommandersPhaseStepSchema: z.ZodType<MoveCommandersPhaseStep> =
  z.enum(moveCommandersPhaseSteps);

/** The state of the move commanders phase. */
export interface MoveCommandersPhaseState {
  /** The current phase of the round. */
  phase: 'moveCommanders';
  /** The step of the move commanders phase. */
  step: MoveCommandersPhaseStep;
}

const _moveCommandersPhaseStateSchemaObject = z
  .object({
    /** The current phase of the round. */
    phase: z.literal('moveCommanders'),
    /** The step of the move commanders phase. */
    step: moveCommandersPhaseStepSchema,
  })
  .strict();

type MoveCommandersPhaseStateSchemaType = z.infer<
  typeof _moveCommandersPhaseStateSchemaObject
>;

/** The schema for the state of the move commanders phase. */
export const moveCommandersPhaseStateSchema: z.ZodObject<{
  phase: z.ZodLiteral<'moveCommanders'>;
  step: z.ZodType<MoveCommandersPhaseStep>;
}> = _moveCommandersPhaseStateSchemaObject;

const _assertExactMoveCommandersPhaseState: AssertExact<
  MoveCommandersPhaseState,
  MoveCommandersPhaseStateSchemaType
> = true;
