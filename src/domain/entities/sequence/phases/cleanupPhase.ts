import type { AssertExact } from '@utils';
import { z } from 'zod';
import { CLEANUP_PHASE } from './phases';

/** Iterable list of valid steps in the cleanup phase. */
export const cleanupPhaseSteps = [
  /** Expect single gameEffect: move played to played cards pile */
  'discardPlayedCards',
  /** Expect single player choice: the initiative player's choose rally choice */
  'firstPlayerChooseRally',
  /** Expect single gameEffect: the resolve rally effect */
  'firstPlayerResolveRally',
  /** Expect series of gameEffects: resolve unit support and consequences */
  'firstPlayerResolveUnitSupport',
  /** Expect single player choice: the non-initiative player's choose rally choice */
  'secondPlayerChooseRally',
  /** Expect single gameEffect: the resolve rally effect */
  'secondPlayerResolveRally',
  /** Expect series of gameEffects: resolve unit support and consequences */
  'secondPlayerResolveUnitSupport',
  /** Expect single gameEffect: advance round and reset phase to play cards phase */
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
  phase: typeof CLEANUP_PHASE;
  /** The step of the cleanup phase. */
  step: CleanupPhaseStep;
}

const _cleanupPhaseStateSchemaObject = z.object({
  /** The current phase of the round. */
  phase: z.literal(CLEANUP_PHASE),
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
