import type { RallyResolutionState } from '@game/substeps';
import type { AssertExact } from '@utils';

import { rallyResolutionStateSchema } from '@game/substeps';
import { z } from 'zod';

/** Iterable list of valid steps in the cleanup phase. */
export const cleanupPhaseSteps = [
  // This round's card leaves play for the played pile (§4.5.1).
  'discardPlayedCards',
  // The first player chooses whether to rally (§10.3.1).
  'firstPlayerChooseRally',
  // Their rally, if they chose one: the burn, the cards taken back, then the
  // support check and any rout it causes, all before the second player
  // decides (§10.3.6). Skipped by a player who declines.
  'firstPlayerResolveRally',
  // Then the second player chooses whether to rally.
  'secondPlayerChooseRally',
  // Their rally, resolved the same way.
  'secondPlayerResolveRally',
  // The round ends, and the next begins with cards being played.
  'complete',
] as const;

/** The type of a step in the cleanup phase. */
export type CleanupPhaseStep = (typeof cleanupPhaseSteps)[number];

/** The schema for a step in the cleanup phase. */
export const cleanupPhaseStepSchema: z.ZodType<CleanupPhaseStep> =
  z.enum(cleanupPhaseSteps);

/** The state of the cleanup phase. */
export interface CleanupPhaseState {
  /** The current phase of the round. */
  phase: 'cleanup';
  /** The step of the cleanup phase. */
  step: CleanupPhaseStep;
  /** The state of the first player's rally resolution (unit support checks). */
  firstPlayerRallyResolutionState: RallyResolutionState | 'pending';
  /** The state of the second player's rally resolution (unit support checks). */
  secondPlayerRallyResolutionState: RallyResolutionState | 'pending';
}

const _cleanupPhaseStateSchemaObject = z
  .object({
    /** The current phase of the round. */
    phase: z.literal('cleanup'),
    /** The step of the cleanup phase. */
    step: cleanupPhaseStepSchema,
    /** The state of the first player's rally resolution (unit support checks). */
    firstPlayerRallyResolutionState: rallyResolutionStateSchema.or(
      z.literal('pending'),
    ),
    /** The state of the second player's rally resolution (unit support checks). */
    secondPlayerRallyResolutionState: rallyResolutionStateSchema.or(
      z.literal('pending'),
    ),
  })
  .strict();

type CleanupPhaseStateSchemaType = z.infer<
  typeof _cleanupPhaseStateSchemaObject
>;

/** The schema for the state of the cleanup phase. */
export const cleanupPhaseStateSchema: z.ZodObject<{
  phase: z.ZodLiteral<'cleanup'>;
  step: z.ZodType<CleanupPhaseStep>;
  firstPlayerRallyResolutionState: z.ZodType<RallyResolutionState | 'pending'>;
  secondPlayerRallyResolutionState: z.ZodType<RallyResolutionState | 'pending'>;
}> = _cleanupPhaseStateSchemaObject;

const _assertExactCleanupPhaseState: AssertExact<
  CleanupPhaseState,
  CleanupPhaseStateSchemaType
> = true;
