import type { UnitInstance } from '@entities';
import type { PhaseState } from './phases';
import type { Event } from '@events';

import { phaseStateSchema } from './phases';
import { unitInstanceSchema } from '@entities';
import { eventSchema } from '@events';
import { z } from 'zod';

import type { AssertExact } from '@utils';

/**
 * The state of a round of the game.
 *
 * Board size lives on `boardState.boardType` in game state, not on the round.
 */
export interface RoundState {
  /** The number of the round. */
  roundNumber: number;
  /** The phases that have been completed in the round. */
  completedPhases: PhaseState[];
  /** The state of the current phase of the round. */
  currentPhaseState: PhaseState | 'none';
  /** Units that have been commanded this round. */
  commandedUnits: UnitInstance[];
  /** Events applied during this round, in order. */
  events: readonly Event[];
}

const _roundStateSchemaObject = z
  .object({
    commandedUnits: z.array(unitInstanceSchema),
    completedPhases: z.array(phaseStateSchema),
    currentPhaseState: phaseStateSchema.or(z.literal('none')),
    events: z.array(eventSchema).readonly(),
    roundNumber: z.int().positive(),
  })
  .strict();

type RoundStateSchemaType = z.infer<typeof _roundStateSchemaObject>;

const _assertExactRoundState: AssertExact<RoundState, RoundStateSchemaType> =
  true;

export const roundStateSchema: z.ZodType<RoundState> = _roundStateSchemaObject;
