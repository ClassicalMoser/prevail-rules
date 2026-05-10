import type { AssertExact } from '@utils';
import { z } from 'zod';

/** Iterable list of valid attack types. */
export const attackTypes = ['melee', 'ranged'] as const;

/** The type of attack (melee or ranged). */
export type AttackType = (typeof attackTypes)[number];

/** The schema object for the attack type. */
const _attackTypeSchemaObject = z.enum(attackTypes);

type AttackTypeSchemaType = z.infer<typeof _attackTypeSchemaObject>;

/** The schema for an attack type. */
export const attackTypeSchema: z.ZodType<AttackType> = _attackTypeSchemaObject;

// Verify manual type matches schema inference
const _assertExactAttackType: AssertExact<AttackType, AttackTypeSchemaType> =
  true;
