import type { Coordinate } from '@entities';

import type { MeleeResolutionState } from '@game/substeps';
import type { AssertExact } from '@utils';
import { coordinateSchema } from '@entities';
import { meleeResolutionStateSchema } from '@game/substeps';
import { z } from 'zod';

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
export interface ResolveMeleePhaseState {
  /** The current phase of the round. */
  phase: 'resolveMelee';
  /** The step of the resolve melee phase. */
  step: ResolveMeleePhaseStep;
  /** The current melee resolution state. */
  currentMeleeResolutionState: MeleeResolutionState | 'pending';
  /** The remaining engagements. */
  remainingEngagements: Coordinate[];
}

const _resolveMeleePhaseStateSchemaObject = z
  .object({
    currentMeleeResolutionState: meleeResolutionStateSchema.or(
      z.literal('pending'),
    ),
    phase: z.literal('resolveMelee'),
    remainingEngagements: z.array(coordinateSchema),
    step: _resolveMeleePhaseStepSchemaObject,
  })
  .strict();

type ResolveMeleePhaseStateSchemaType = z.infer<
  typeof _resolveMeleePhaseStateSchemaObject
>;

const _assertExactResolveMeleePhaseState: AssertExact<
  ResolveMeleePhaseState,
  ResolveMeleePhaseStateSchemaType
> = true;

export const resolveMeleePhaseStateSchema: z.ZodType<ResolveMeleePhaseState> =
  _resolveMeleePhaseStateSchemaObject;
