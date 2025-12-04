import type { AssertExact } from '@utils';
import { z } from 'zod';

/** Iterable list of valid steps in the cleanup phase. */
export const cleanupPhaseSteps = [
  'discardPlayedCards',
  'firstPlayerChooseRally',
  'firstPlayerResolveRally',
  'secondPlayerChooseRally',
  'secondPlayerResolveRally',
  'complete',
] as const;

/** The step of the cleanup phase. */
export type CleanupPhaseStep = (typeof cleanupPhaseSteps)[number];

const _cleanupPhaseStepSchemaObject = z.enum(cleanupPhaseSteps);
type CleanupPhaseStepSchemaType = z.infer<typeof _cleanupPhaseStepSchemaObject>;

const _assertExactCleanupPhaseStep: AssertExact<
  CleanupPhaseStep,
  CleanupPhaseStepSchemaType
> = true;

/** The schema for the step of the cleanup phase. */
export const cleanupPhaseStepSchema: z.ZodType<CleanupPhaseStep> =
  _cleanupPhaseStepSchemaObject;

/** The state of the cleanup phase. */
export interface CleanupPhaseState {
  /** The current phase of the round. */
  phase: 'cleanup';
  /** The step of the cleanup phase. */
  step: CleanupPhaseStep;
}

const _cleanupPhaseStateSchemaObject = z.object({
  /** The current phase of the round. */
  phase: z.literal('cleanup' as const),
  /** The step of the cleanup phase. */
  step: cleanupPhaseStepSchema,
});

type CleanupPhaseStateSchemaType = z.infer<
  typeof _cleanupPhaseStateSchemaObject
>;

const _assertExactCleanupPhaseState: AssertExact<
  CleanupPhaseState,
  CleanupPhaseStateSchemaType
> = true;

/** The schema for the state of the cleanup phase. */
export const cleanupPhaseStateSchema: z.ZodObject<{
  phase: z.ZodLiteral<'cleanup'>;
  step: z.ZodType<CleanupPhaseStep>;
}> = _cleanupPhaseStateSchemaObject;
