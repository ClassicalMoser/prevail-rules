import type { Board } from '@entities/board';
import type { UnitPlacement, UnitWithPlacement } from '@entities/unitLocation';
import type { AssertExact } from '@utils';
import {
  unitPlacementSchema,
  unitWithPlacementSchema,
} from '@entities/unitLocation';
import { z } from 'zod';

/** The state of a retreat substep. */
export interface RetreatState<TBoard extends Board> {
  /** The type of the substep. */
  substepType: 'retreat';
  /** The unit that is retreating. */
  retreatingUnit: UnitWithPlacement<TBoard>;
  /** The result of the retreat. */
  finalPosition: UnitPlacement<TBoard> | undefined;
}

/** The schema for the state of a retreat substep. */
const _retreatStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('retreat'),
  /** The unit that is retreating. */
  retreatingUnit: unitWithPlacementSchema,
  /** The result of the retreat. */
  finalPosition: unitPlacementSchema.or(z.undefined()),
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
  finalPosition: z.ZodType<UnitPlacement<Board> | undefined>;
}> = _retreatStateSchemaObject;
