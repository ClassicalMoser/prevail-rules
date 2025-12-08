import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import type { PhaseState } from './phases';

import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';
import { phaseStateSchema } from './phases';


/**
 * The state of a round of the game.
 */
export interface RoundState {
  /** The number of the round. */
  roundNumber: number;
  /** The phases that have been completed in the round. */
  completedPhases: Set<PhaseState>;
  /** The state of the current phase of the round. */
  currentPhaseState?: PhaseState;
  /** Units that have moved this round. */
  unitsThatMoved: Set<UnitInstance>;
  /** Units that have made ranged attacks this round. */
  unitsThatMadeRangedAttacks: Set<UnitInstance>;
}

const _roundStateSchemaObject = z.object({
  /** The number of the round. */
  roundNumber: z.int().positive(),
  /** The phases that have been completed in the round. */
  completedPhases: z.set(phaseStateSchema),
  /** The state of the current phase of the round. */
  currentPhaseState: phaseStateSchema.optional(),
  /** Units that have moved this round. */
  unitsThatMoved: z.set(unitInstanceSchema),
  /** Units that have made ranged attacks this round. */
  unitsThatMadeRangedAttacks: z.set(unitInstanceSchema),
});

type RoundStateSchemaType = z.infer<typeof _roundStateSchemaObject>;

/**
 * The schema for the state of a round.
 */
export const roundStateSchema: z.ZodType<RoundState> = _roundStateSchemaObject;

// Verify manual type matches schema inference
const _assertExactRoundState: AssertExact<RoundState, RoundStateSchemaType> =
  true;
