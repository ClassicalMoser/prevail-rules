import type { AssertExact } from '@utils';
import type { RallyResolutionState } from '../substeps';

import { z } from 'zod';
import { rallyResolutionStateSchema } from '../substeps';
import { CLEANUP_PHASE } from './phases';

/** Iterable list of valid steps in the cleanup phase. */
export const cleanupPhaseSteps = [
  /** Expect single gameEffect: move played to played cards pile */
  'discardPlayedCards',
  /** Expect single player choice: the initiative player's choose rally choice */
  'firstPlayerChooseRally',
  /** Expect single gameEffect: the resolve rally effect (includes unit support) */
  'firstPlayerResolveRally',
  /** Expect single player choice: the non-initiative player's choose rally choice */
  'secondPlayerChooseRally',
  /** Expect single gameEffect: the resolve rally effect (includes unit support) */
  'secondPlayerResolveRally',
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
  /** The state of the first player's rally resolution (unit support checks). */
  firstPlayerRallyResolutionState: RallyResolutionState | undefined;
  /** The state of the second player's rally resolution (unit support checks). */
  secondPlayerRallyResolutionState: RallyResolutionState | undefined;
}

const _cleanupPhaseStateSchemaObject = z.object({
  /** The current phase of the round. */
  phase: z.literal(CLEANUP_PHASE),
  /** The step of the cleanup phase. */
  step: cleanupPhaseStepSchema,
  /** The state of the first player's rally resolution (unit support checks). */
  firstPlayerRallyResolutionState: rallyResolutionStateSchema.or(z.undefined()),
  /** The state of the second player's rally resolution (unit support checks). */
  secondPlayerRallyResolutionState: rallyResolutionStateSchema.or(
    z.undefined(),
  ),
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
  firstPlayerRallyResolutionState: z.ZodType<RallyResolutionState | undefined>;
  secondPlayerRallyResolutionState: z.ZodType<RallyResolutionState | undefined>;
}> = _cleanupPhaseStateSchemaObject;
