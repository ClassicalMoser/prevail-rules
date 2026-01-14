import type { AssertExact } from '@utils';
import { z } from 'zod';

/** The result of an attack. */
export interface AttackResult {
  /** Whether the unit is routed. */
  unitRouted: boolean;
  /** Whether the unit is reversed. */
  unitReversed: boolean;
  /** Whether the unit is retreated. */
  unitRetreated: boolean;
}

/** The schema for an attack result. */
const _attackResultSchemaObject = z.object({
  /** Whether the unit is routed. */
  unitRouted: z.boolean(),
  /** Whether the unit is reversed. */
  unitReversed: z.boolean(),
  /** Whether the unit is retreated. */
  unitRetreated: z.boolean(),
});

/** The type of an attack result. */
type AttackResultSchemaType = z.infer<typeof _attackResultSchemaObject>;

/** Assert that the attack result is exact. */
const _assertExactAttackResult: AssertExact<
  AttackResult,
  AttackResultSchemaType
> = true;

/** The schema for an attack result. */
export const attackResultSchema: z.ZodType<AttackResult> =
  _attackResultSchemaObject;
