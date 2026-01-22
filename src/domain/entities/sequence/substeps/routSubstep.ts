import type { PlayerSide } from '@entities/player';
import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities/player';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';

/**
 * Composable substep that handles card discarding when units rout.
 *
 * This is a **composable substep** - it can be reused in multiple contexts:
 * - Used in `RetreatState` (when no legal retreat options exist)
 * - Used in `EngagementState` (for rear engagements)
 * - Used in `RallyResolutionState` (when units lose support)
 *
 * It demonstrates a **nearly recursive pattern**:
 * - Can be nested within `RetreatState`
 * - This creates a pattern where routing can occur during retreat
 *
 * The expected event query `getExpectedRoutEvent()` is composable and
 * can be called from any parent context that contains this state.
 */
export interface RoutState {
  /** The type of the substep. */
  substepType: 'rout';
  /** The player that is discarding cards. */
  player: PlayerSide;
  /** The units that are being routed. */
  unitsToRout: Set<UnitInstance>;
  /** The number of cards to discard. */
  numberToDiscard: number | undefined;
  /** Whether the cards have been chosen. */
  cardsChosen: boolean;
  /** Whether the rout has been completed. */
  completed: boolean;
}

/** The schema for the state of the rout discard substep. */
const _routStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('rout'),
  /** The player that is discarding cards. */
  player: playerSideSchema,
  /** The units that are being routed. */
  unitsToRout: z.set(unitInstanceSchema),
  /** The number of cards to discard. */
  numberToDiscard: z.number().or(z.undefined()),
  /** Whether the cards have been chosen. */
  cardsChosen: z.boolean(),
  /** Whether the rout has been completed. */
  completed: z.boolean(),
});

type RoutStateSchemaType = z.infer<typeof _routStateSchemaObject>;

const _assertExactRoutState: AssertExact<RoutState, RoutStateSchemaType> = true;

/** The schema for the state of the rout discard substep. */
export const routStateSchema: z.ZodType<RoutState> = _routStateSchemaObject;
