import type { Board } from '@entities/board';
import type { UnitPlacement, UnitWithPlacement } from '@entities/unitLocation';
import type { AssertExact } from '@utils';
import type { RoutState } from './routSubstep';
import {
  unitPlacementSchema,
  unitWithPlacementSchema,
} from '@entities/unitLocation';
import { z } from 'zod';
import { routStateSchema } from './routSubstep';

/**
 * Composable substep that handles unit retreat.
 *
 * This is a **composable substep** - it can be reused in multiple contexts:
 * - Used in `AttackApplyState` (when unit retreats after an attack)
 * - Used in `EngagementState` (when unit retreats from engagement)
 *
 * It demonstrates a **nearly recursive pattern**:
 * - Can contain `RoutState` (if no legal retreat options exist)
 * - This creates a pattern where routing can occur during retreat
 *
 * The expected event query `getExpectedRetreatEvent()` is composable and
 * delegates to `getExpectedRoutEvent()` when a rout state is present.
 */
export interface RetreatState<TBoard extends Board> {
  /** The type of the substep. */
  substepType: 'retreat';
  /** The unit that is retreating. */
  retreatingUnit: UnitWithPlacement<TBoard>;
  /** The legal retreat options (determined when state is created). */
  legalRetreatOptions: Set<UnitPlacement<TBoard>>;
  /** The result of the retreat (undefined if player must choose, set if auto-selected or chosen). */
  finalPosition: UnitPlacement<TBoard> | undefined;
  /** The state of a rout caused by the retreat. */
  routState: RoutState | undefined;
  /** Whether the retreat has been completed. */
  completed: boolean;
}

/** The schema for the state of a retreat substep. */
const _retreatStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('retreat'),
  /** The unit that is retreating. */
  retreatingUnit: unitWithPlacementSchema,
  /** The legal retreat options (determined when state is created). */
  legalRetreatOptions: z.set(unitPlacementSchema),
  /** The result of the retreat (undefined if player must choose, set if auto-selected or chosen). */
  finalPosition: unitPlacementSchema.or(z.undefined()),
  /** The state of a rout caused by the retreat. */
  routState: routStateSchema.or(z.undefined()),
  /** Whether the retreat has been completed. */
  completed: z.boolean(),
});

type RetreatStateSchemaType = z.infer<typeof _retreatStateSchemaObject>;

// Assert that the retreat state is exact.
const _assertExactRetreatState: AssertExact<
  RetreatState<any>,
  RetreatStateSchemaType
> = true;

/** The schema for the state of a retreat substep. */
export const retreatStateSchema: z.ZodObject<{
  substepType: z.ZodLiteral<'retreat'>;
  retreatingUnit: z.ZodType<UnitWithPlacement<Board>>;
  legalRetreatOptions: z.ZodSet<typeof unitPlacementSchema>;
  finalPosition: z.ZodType<UnitPlacement<Board> | undefined>;
  routState: z.ZodType<import('./routSubstep').RoutState | undefined>;
  completed: z.ZodType<boolean>;
}> = _retreatStateSchemaObject;
