import type { AssertExact } from '@utils';

import { z } from 'zod';
import { MOVE_COMMANDERS_PHASE } from './phases';

/** Iterable list of valid steps in the move commanders phase. */
export const moveCommandersPhaseSteps = [
  'moveFirstCommander', // Needs one player choice: the initiative player's move commander choice
  'moveSecondCommander', // Needs one player choice: the non-initiative player's move commander choice
  'complete', // GameEffect, advance phase to issue commands phase
] as const;

/** The step of the move commanders phase. */
export type MoveCommandersPhaseStep = (typeof moveCommandersPhaseSteps)[number];

const _moveCommandersPhaseStepSchemaObject = z.enum(moveCommandersPhaseSteps);
type MoveCommandersPhaseStepSchemaType = z.infer<
  typeof _moveCommandersPhaseStepSchemaObject
>;

const _assertExactMoveCommandersPhaseStep: AssertExact<
  MoveCommandersPhaseStep,
  MoveCommandersPhaseStepSchemaType
> = true;

export const moveCommandersPhaseStepSchema: z.ZodType<MoveCommandersPhaseStep> =
  _moveCommandersPhaseStepSchemaObject;

/** The state of the move commanders phase. */
export interface MoveCommandersPhaseState {
  /** The current phase of the round. */
  phase: typeof MOVE_COMMANDERS_PHASE;
  /** The step of the move commanders phase. */
  step: MoveCommandersPhaseStep;
}

const _moveCommandersPhaseStateSchemaObject = z.object({
  /** The current phase of the round. */
  phase: z.literal(MOVE_COMMANDERS_PHASE),
  /** The step of the move commanders phase. */
  step: moveCommandersPhaseStepSchema,
});

type MoveCommandersPhaseStateSchemaType = z.infer<
  typeof _moveCommandersPhaseStateSchemaObject
>;

const _assertExactMoveCommandersPhaseState: AssertExact<
  MoveCommandersPhaseState,
  MoveCommandersPhaseStateSchemaType
> = true;

/** The schema for the state of the move commanders phase. */
export const moveCommandersPhaseStateSchema: z.ZodObject<{
  phase: z.ZodLiteral<'moveCommanders'>;
  step: z.ZodType<MoveCommandersPhaseStep>;
}> = _moveCommandersPhaseStateSchemaObject;
