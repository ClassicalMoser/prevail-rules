import type { AssertExact } from '@utils';
import { z } from 'zod';

/** Iterable list of valid steps in the card phase. */
export const playCardsPhaseSteps = [
  'chooseCards', // Needs two player choices: one for each player
  'revealCards', // Needs one gameEffect: the reveal cards effect
  'assignInitiative', // Needs one gameEffect: the assign initiative effect
  'complete', // GameEffect, advances phase to move commanders phase
] as const;

/** The type of a step in the card phase. */
export type PlayCardsPhaseStep = (typeof playCardsPhaseSteps)[number];

const _playCardsPhaseStepSchemaObject = z.enum(playCardsPhaseSteps);
type PlayCardsPhaseStepSchemaType = z.infer<
  typeof _playCardsPhaseStepSchemaObject
>;

/** The schema for a step in the card phase. */
export const playCardsPhaseStepSchema: z.ZodType<PlayCardsPhaseStep> =
  _playCardsPhaseStepSchemaObject;

// Verify manual type matches schema inference
const _assertExactCardPhaseStep: AssertExact<
  PlayCardsPhaseStep,
  PlayCardsPhaseStepSchemaType
> = true;

/** The state of the card phase. */
export interface PlayCardsPhaseState {
  /** The current phase of the round. */
  phase: 'playCards';
  /** The step of the card phase. */
  step: PlayCardsPhaseStep;
}

const _playCardsPhaseStateSchemaObject = z.object({
  /** The current phase of the round. */
  phase: z.literal('playCards'),
  /** The step of the card phase. */
  step: playCardsPhaseStepSchema,
});

type PlayCardsPhaseStateSchemaType = z.infer<
  typeof _playCardsPhaseStateSchemaObject
>;

/** The schema for the state of the card phase. */
export const playCardsPhaseStateSchema: z.ZodObject<{
  phase: z.ZodLiteral<'playCards'>;
  step: z.ZodType<PlayCardsPhaseStep>;
}> = _playCardsPhaseStateSchemaObject;

// Verify manual type matches schema inference
const _assertExactPlayCardsPhaseState: AssertExact<
  PlayCardsPhaseState,
  PlayCardsPhaseStateSchemaType
> = true;
