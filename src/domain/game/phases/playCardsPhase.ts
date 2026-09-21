import type { AssertExact } from '@utils';

import { z } from 'zod';

/** Iterable list of valid steps in the play cards phase. */
export const playCardsPhaseSteps = [
  'chooseCards', // Expect two player choices: one choose-card per player
  'revealCards', // Expect one gameEffect: reveal cards
  'assignInitiative', // Expect one gameEffect: assign initiative
  'complete', // Expect one gameEffect: advance to move commanders phase
] as const;

/** The type of a step in the play cards phase. */
export type PlayCardsPhaseStep = (typeof playCardsPhaseSteps)[number];

/** The schema for a step in the play cards phase. */
export const playCardsPhaseStepSchema: z.ZodType<PlayCardsPhaseStep> =
  z.enum(playCardsPhaseSteps);

/** The state of the play cards phase. */
export interface PlayCardsPhaseState {
  /** The current phase of the round. */
  phase: 'playCards';
  /** The step of the play cards phase. */
  step: PlayCardsPhaseStep;
}

const _playCardsPhaseStateSchemaObject = z
  .object({
    /** The current phase of the round. */
    phase: z.literal('playCards'),
    /** The step of the play cards phase. */
    step: playCardsPhaseStepSchema,
  })
  .strict();

type PlayCardsPhaseStateSchemaType = z.infer<
  typeof _playCardsPhaseStateSchemaObject
>;

/** The schema for the state of the play cards phase. */
export const playCardsPhaseStateSchema: z.ZodObject<{
  phase: z.ZodLiteral<'playCards'>;
  step: z.ZodType<PlayCardsPhaseStep>;
}> = _playCardsPhaseStateSchemaObject;

const _assertExactPlayCardsPhaseState: AssertExact<
  PlayCardsPhaseState,
  PlayCardsPhaseStateSchemaType
> = true;
