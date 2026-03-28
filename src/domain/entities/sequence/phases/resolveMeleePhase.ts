import type { Board, BoardCoordinate } from '@entities/board';

import type { AssertExact } from '@utils';
import type { MeleeResolutionState } from '../substeps';
import { boardCoordinateSchema } from '@entities/board';
import { z } from 'zod';
import { meleeResolutionStateSchema } from '../substeps';

/** Iterable list of valid steps in the resolve melee phase. */
export const resolveMeleePhaseSteps = [
  /** Most complex step: Loop through remaining engagements and expect resolve melee events */
  'resolveMelee',
  /** Expect single gameEffect: advance to cleanup phase */
  'complete',
] as const;

/** The step of the resolve melee phase. */
export type ResolveMeleePhaseStep = (typeof resolveMeleePhaseSteps)[number];

const _resolveMeleePhaseStepSchemaObject = z.enum(resolveMeleePhaseSteps);
type ResolveMeleePhaseStepSchemaType = z.infer<
  typeof _resolveMeleePhaseStepSchemaObject
>;

/** The schema for the step of the resolve melee phase. */
export const resolveMeleePhaseStepSchema: z.ZodType<ResolveMeleePhaseStep> =
  _resolveMeleePhaseStepSchemaObject;

const _assertExactResolveMeleePhaseStep: AssertExact<
  ResolveMeleePhaseStep,
  ResolveMeleePhaseStepSchemaType
> = true;

/** The state of the resolve melee phase. */
export interface ResolveMeleePhaseState<TBoard extends Board> {
  /** The current phase of the round. */
  phase: 'resolveMelee';
  /** The step of the resolve melee phase. */
  step: ResolveMeleePhaseStep;
  /** The state of the ongoing melee resolution. */
  currentMeleeResolutionState: MeleeResolutionState<TBoard> | undefined;
  /** The remaining engagements that need to be resolved. */
  remainingEngagements: Set<BoardCoordinate<TBoard>>;
}

const _resolveMeleePhaseStateSchemaObject = z.object({
  /** The current phase of the round. */
  phase: z.literal('resolveMelee'),
  /** The step of the resolve melee phase. */
  step: resolveMeleePhaseStepSchema,
  /** The state of the ongoing melee resolution. */
  currentMeleeResolutionState: meleeResolutionStateSchema.or(z.undefined()),
  /** The remaining engagements that need to be resolved. */
  remainingEngagements: z.set(boardCoordinateSchema),
});

type ResolveMeleePhaseStateSchemaType = z.infer<
  typeof _resolveMeleePhaseStateSchemaObject
>;

/** The schema for the state of the resolve melee phase. */
export const resolveMeleePhaseStateSchema: z.ZodObject<{
  phase: z.ZodLiteral<'resolveMelee'>;
  step: z.ZodType<ResolveMeleePhaseStep>;
  currentMeleeResolutionState: z.ZodType<
    MeleeResolutionState<Board> | undefined
  >;
  remainingEngagements: z.ZodSet<z.ZodType<BoardCoordinate<Board>>>;
}> = _resolveMeleePhaseStateSchemaObject;

const _assertExactResolveMeleePhaseState: AssertExact<
  ResolveMeleePhaseState<Board>,
  ResolveMeleePhaseStateSchemaType
> = true;
