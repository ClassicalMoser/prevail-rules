import type { UnitWithPlacement } from '@entities';
import type { RetreatOption } from './retreatOption';
import type { AssertExact } from '@utils';
import type { RoutState } from './routSubstep';
import { unitWithPlacementSchema } from '@entities';
import { retreatOptionSchema } from './retreatOption';
import { z } from 'zod';
import { routStateSchema } from './routSubstep';

/**
 * Composable substep that handles unit retreat.
 *
 * This is a **composable substep** - it can be reused in multiple contexts:
 * - Used in `AttackApplyState` (when unit retreats after an attack)
 * - Used in `EngagementState` (when unit retreats from engagement)
 *
 * May nest a `RoutState` when retreat fails or leads to a rout (composition,
 * not recursion). `getExpectedRetreatEvent()` delegates to
 * `getExpectedRoutEvent()` when that nested slice is present.
 */
export interface RetreatState {
  /** The type of the substep. */
  substepType: 'retreat';
  /** The unit that is retreating. */
  retreatingUnit: UnitWithPlacement;
  /** Where the unit may fall back to, each by one path (§9.1.3). */
  legalRetreatOptions: RetreatOption[];
  /**
   * The retreat to be carried out: chosen by the player among several, or
   * filled in at once when there is only one. `'pending'` until then.
   */
  chosenRetreat: RetreatOption | 'pending';
  /**
   * Rout nested under this retreat: `'pending'` when the unit has nowhere to
   * go (a rout is still due), `'bypassed'` when it has legal hexes (a retreat
   * with somewhere to go will never rout), or the open `RoutState`.
   */
  routState: RoutState | 'pending' | 'bypassed';
  /** Whether the retreat has been completed. */
  completed: boolean;
}

const _retreatStateSchemaObject = z
  .object({
    chosenRetreat: retreatOptionSchema.or(z.literal('pending')),
    completed: z.boolean(),
    legalRetreatOptions: z.array(retreatOptionSchema),
    retreatingUnit: unitWithPlacementSchema,
    routState: routStateSchema
      .or(z.literal('pending'))
      .or(z.literal('bypassed')),
    substepType: z.literal('retreat'),
  })
  .strict();

type RetreatStateSchemaType = z.infer<typeof _retreatStateSchemaObject>;

export const retreatStateSchema: z.ZodType<RetreatState> =
  _retreatStateSchemaObject;

const _assertExactRetreatState: AssertExact<
  RetreatState,
  RetreatStateSchemaType
> = true;
