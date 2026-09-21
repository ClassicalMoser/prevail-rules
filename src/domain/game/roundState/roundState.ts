import type { UnitInstance } from '@entities';
import type { Event } from '@events';
import type { AssertExact } from '@utils';
import type { PhaseState } from '@game/phases';

import { unitInstanceSchema } from '@entities';
import { eventSchema } from '@events';
import { z } from 'zod';
import { phaseStateSchema } from '@game/phases';

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
    /** The number of the round. */
    roundNumber: z.int().positive(),
    /** The phases that have been completed in the round. */
    completedPhases: z.array(phaseStateSchema),
    /** The state of the current phase of the round. */
    currentPhaseState: phaseStateSchema.or(z.literal('none')),
    /** Units that have been commanded this round. */
    commandedUnits: z.array(unitInstanceSchema),
    /** Events applied during this round, in order. */
    events: z.array(eventSchema).readonly(),
  })
  .strict();

type RoundStateSchemaType = z.infer<typeof _roundStateSchemaObject>;

/** The schema for a round of the game. */
export const roundStateSchema: z.ZodType<RoundState> = _roundStateSchemaObject;

const _assertExactRoundState: AssertExact<RoundState, RoundStateSchemaType> =
  true;
