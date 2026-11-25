import type { Coordinate } from '@entities';
import type { MeleeResolutionState } from '@game/substeps';
import type { AssertExact } from '@utils';

import { coordinateSchema } from '@entities';
import { meleeResolutionStateSchema } from '@game/substeps';
import { z } from 'zod';

/** Iterable list of valid steps in the resolve melee phase. */
export const resolveMeleePhaseSteps = [
  // Every engaged space fights, one at a time, in the order the first player
  // chooses, each resolved completely before the next (§4.4.1, §4.4.2).
  'resolveMelee',
  // The phase ends, and cleanup follows.
  'complete',
] as const;

/** The type of a step in the resolve melee phase. */
export type ResolveMeleePhaseStep = (typeof resolveMeleePhaseSteps)[number];

/** The schema for a step in the resolve melee phase. */
export const resolveMeleePhaseStepSchema: z.ZodType<ResolveMeleePhaseStep> =
  z.enum(resolveMeleePhaseSteps);

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
    /** The current phase of the round. */
    phase: z.literal('resolveMelee'),
    /** The step of the resolve melee phase. */
    step: resolveMeleePhaseStepSchema,
    /** The current melee resolution state. */
    currentMeleeResolutionState: meleeResolutionStateSchema.or(
      z.literal('pending'),
    ),
    /** The remaining engagements. */
    remainingEngagements: z.array(coordinateSchema),
  })
  .strict();

type ResolveMeleePhaseStateSchemaType = z.infer<
  typeof _resolveMeleePhaseStateSchemaObject
>;

/** The schema for the state of the resolve melee phase. */
export const resolveMeleePhaseStateSchema: z.ZodObject<{
  phase: z.ZodLiteral<'resolveMelee'>;
  step: z.ZodType<ResolveMeleePhaseStep>;
  currentMeleeResolutionState: z.ZodType<MeleeResolutionState | 'pending'>;
  remainingEngagements: z.ZodArray<z.ZodType<Coordinate>>;
}> = _resolveMeleePhaseStateSchemaObject;

const _assertExactResolveMeleePhaseState: AssertExact<
  ResolveMeleePhaseState,
  ResolveMeleePhaseStateSchemaType
> = true;
