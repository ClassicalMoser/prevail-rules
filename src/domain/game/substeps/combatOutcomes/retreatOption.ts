import type { MoveDelta, UnitPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { moveDeltaSchema, unitPlacementSchema } from '@entities';
import { z } from 'zod';

/**
 * One place a retreating unit may fall back to, and the way it gets there
 * (§9.1). The path is what a client animates and what the retreat choice
 * names; the placement is where the unit ends.
 *
 * A retreat is judged by where it ends (§9.1.3), so each ending is offered
 * once, by one path, even when another path of the same size reaches it.
 */
export interface RetreatOption {
  /** The steps and turns of the fall-back, in order. */
  path: MoveDelta[];
  /** Where the unit stands, and which way it faces, when the retreat ends. */
  placement: UnitPlacement;
}

const _retreatOptionSchemaObject = z
  .object({
    path: z.array(moveDeltaSchema),
    placement: unitPlacementSchema,
  })
  .strict();

type RetreatOptionSchemaType = z.infer<typeof _retreatOptionSchemaObject>;

/** The schema for one retreat option. */
export const retreatOptionSchema: z.ZodType<RetreatOption> =
  _retreatOptionSchemaObject;

const _assertExactRetreatOption: AssertExact<
  RetreatOption,
  RetreatOptionSchemaType
> = true;
