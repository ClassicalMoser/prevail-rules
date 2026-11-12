import type { AssertExact } from '@utils';

import { z } from 'zod';

/**
 * What an attack's blow reached against the defender's thresholds (§7.1.5):
 * Retreat, Reverse and Rout, each reached or not. The game's results follow
 * from these in stages (§7.5.2).
 *
 * TODO(misleading): §7.1.5 is the deficit lowering thresholds; meeting a
 * threshold is §7.5.1. Settled by correcting the reference.
 */
export interface AttackResult {
  /** Whether the unit is routed. */
  unitRouted: boolean;
  /** Whether the unit is reversed. */
  unitReversed: boolean;
  /** Whether the unit is retreated. */
  unitRetreated: boolean;
}

const _attackResultSchemaObject = z
  .object({
    /** Whether the unit is routed. */
    unitRouted: z.boolean(),
    /** Whether the unit is reversed. */
    unitReversed: z.boolean(),
    /** Whether the unit is retreated. */
    unitRetreated: z.boolean(),
  })
  .strict();

type AttackResultSchemaType = z.infer<typeof _attackResultSchemaObject>;

/** The schema for an attack result. */
export const attackResultSchema: z.ZodType<AttackResult> =
  _attackResultSchemaObject;

const _assertExactAttackResult: AssertExact<
  AttackResult,
  AttackResultSchemaType
> = true;
