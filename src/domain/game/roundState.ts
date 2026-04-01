import type { Board, UnitInstance } from '@entities';
import type { Event } from '@events';
import type { AssertExact } from '@utils';

import type { PhaseState } from './phases';
import { unitInstanceSchema } from '@entities';
import { eventSchema } from '@events';
import { z } from 'zod';
import { phaseStateSchema } from './phases';

/**
 * The state of a round of the game.
 */
export interface RoundState<TBoard extends Board> {
  /** The number of the round. */
  roundNumber: number;
  /** The phases that have been completed in the round. */
  completedPhases: Set<PhaseState>;
  /** The state of the current phase of the round. */
  currentPhaseState: PhaseState | undefined;
  /** Units that have been commanded this round. */
  commandedUnits: Set<UnitInstance>;
  /** Events applied during this round, in order. */
  events: readonly Event<TBoard>[];
}

const _roundStateSchemaObject = z.object({
  /** The number of the round. */
  roundNumber: z.int().positive(),
  /** The phases that have been completed in the round. */
  completedPhases: z.set(phaseStateSchema),
  /** The state of the current phase of the round. */
  currentPhaseState: phaseStateSchema.or(z.undefined()),
  /** Units that have been commanded this round. */
  commandedUnits: z.set(unitInstanceSchema),
  /** Events applied during this round, in order. */
  events: z.array(eventSchema).readonly(),
});

type RoundStateSchemaType = z.infer<typeof _roundStateSchemaObject>;

/**
 * The schema for the state of a round.
 */
export const roundStateSchema: z.ZodType<RoundState<Board>> =
  _roundStateSchemaObject;

// Verify manual type matches schema inference
const _assertExactRoundState: AssertExact<
  RoundState<Board>,
  RoundStateSchemaType
> = true;
