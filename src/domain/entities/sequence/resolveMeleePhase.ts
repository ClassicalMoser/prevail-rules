import type { EngagedUnitPresence } from '@entities/unitPresence';
import type { AssertExact } from '@utils';

import { engagedUnitPresenceSchema } from '@entities/unitPresence';
import { z } from 'zod';
import { RESOLVE_MELEE_PHASE } from './phases';


/** Iterable list of valid steps in the resolve melee phase. */
export const resolveMeleePhaseSteps = ['resolveMelee', 'complete'] as const;

/** The step of the resolve melee phase. */
export type ResolveMeleePhaseStep = (typeof resolveMeleePhaseSteps)[number];

const _resolveMeleePhaseStepSchemaObject = z.enum(resolveMeleePhaseSteps);
type ResolveMeleePhaseStepSchemaType = z.infer<
  typeof _resolveMeleePhaseStepSchemaObject
>;

const _assertExactResolveMeleePhaseStep: AssertExact<
  ResolveMeleePhaseStep,
  ResolveMeleePhaseStepSchemaType
> = true;

/** The schema for the step of the resolve melee phase. */
export const resolveMeleePhaseStepSchema: z.ZodType<ResolveMeleePhaseStep> =
  _resolveMeleePhaseStepSchemaObject;

/** The state of the resolve melee phase. */
export interface ResolveMeleePhaseState {
  /** The current phase of the round. */
  phase: typeof RESOLVE_MELEE_PHASE;
  /** The step of the resolve melee phase. */
  step: ResolveMeleePhaseStep;
  /** The remaining engagements that need to be resolved. */
  remainingEngagements: Set<EngagedUnitPresence>;
}

const _resolveMeleePhaseStateSchemaObject = z.object({
  /** The current phase of the round. */
  phase: z.literal(RESOLVE_MELEE_PHASE),
  /** The step of the resolve melee phase. */
  step: resolveMeleePhaseStepSchema,
  /** The remaining engagements that need to be resolved. */
  remainingEngagements: z.set(engagedUnitPresenceSchema),
});

type ResolveMeleePhaseStateSchemaType = z.infer<
  typeof _resolveMeleePhaseStateSchemaObject
>;

const _assertExactResolveMeleePhaseState: AssertExact<
  ResolveMeleePhaseState,
  ResolveMeleePhaseStateSchemaType
> = true;

/** The schema for the state of the resolve melee phase. */
export const resolveMeleePhaseStateSchema: z.ZodObject<{
  phase: z.ZodLiteral<'resolveMelee'>;
  step: z.ZodType<ResolveMeleePhaseStep>;
  remainingEngagements: z.ZodSet<z.ZodType<EngagedUnitPresence>>;
}> = _resolveMeleePhaseStateSchemaObject;
