import type { UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import type { PhaseState } from '@game/phases';

import { unitInstanceSchema } from '@entities';
import { z } from 'zod';
import { phaseStateSchema } from '@game/phases';

/**
 * One round: its number, its phases, and the units commanded so far. Every
 * view of the game holds the same round; the events that made it are the
 * game's stream, not the round's.
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
}

const _roundStateSchemaObject = z
  .object({
    /** The number of the round. */
    // Setup is round 0, with its own events; the first round to be played is 1.
    roundNumber: z.int().min(0),
    /** The phases that have been completed in the round. */
    completedPhases: z.array(phaseStateSchema),
    /** The state of the current phase of the round. */
    currentPhaseState: phaseStateSchema.or(z.literal('none')),
    /** Units that have been commanded this round. */
    commandedUnits: z.array(unitInstanceSchema),
  })
  .strict();

type RoundStateSchemaType = z.infer<typeof _roundStateSchemaObject>;

/** The schema for a round. */
export const roundStateSchema: z.ZodObject<{
  roundNumber: z.ZodInt;
  completedPhases: z.ZodArray<typeof phaseStateSchema>;
  currentPhaseState: z.ZodUnion<
    readonly [typeof phaseStateSchema, z.ZodLiteral<'none'>]
  >;
  commandedUnits: z.ZodArray<typeof unitInstanceSchema>;
}> = _roundStateSchemaObject;

const _assertExactRoundState: AssertExact<RoundState, RoundStateSchemaType> =
  true;
