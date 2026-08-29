import type { PlayerSide, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitInstanceSchema } from '@entities';
import { z } from 'zod';

/**
 * Composable substep that handles card discarding when units rout.
 *
 * This is a **composable substep** - it can be reused in multiple contexts:
 * - Used in `RetreatState` (when no legal retreat options exist)
 * - Used in `EngagementState` (for rear engagements)
 * - Used in `RallyResolutionState` (when units lose support)
 *
 * Often nested under `RetreatState` (composition, not recursion).
 * `getExpectedRoutEvent()` is composable from any parent that holds this slice.
 */
export interface RoutState {
  /** The type of the substep. */
  substepType: 'rout';
  /** The player that is discarding cards. */
  player: PlayerSide;
  /** The units that are being routed. */
  unitsToRout: UnitInstance[];
  /** The number of cards to discard. */
  numberToDiscard: number | 'pending';
  /** Whether the cards have been chosen. */
  cardsChosen: boolean;
  /** Whether the rout has been completed. */
  completed: boolean;
}

/** The schema for the state of the rout discard substep. */
const _routStateSchemaObject = z
  .object({
    /** The type of the substep. */
    substepType: z.literal('rout'),
    /** The player that is discarding cards. */
    player: playerSideSchema,
    /** The units that are being routed. */
    unitsToRout: z.array(unitInstanceSchema),
    /** The number of cards to discard. */
    numberToDiscard: z.number().or(z.literal('pending')),
    /** Whether the cards have been chosen. */
    cardsChosen: z.boolean(),
    /** Whether the rout has been completed. */
    completed: z.boolean(),
  })
  .strict();

type RoutStateSchemaType = z.infer<typeof _routStateSchemaObject>;

const _assertExactRoutState: AssertExact<RoutState, RoutStateSchemaType> = true;

/** The schema for the state of the rout discard substep. */
export const routStateSchema: z.ZodType<RoutState> = _routStateSchemaObject;
