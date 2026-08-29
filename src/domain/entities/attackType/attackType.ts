import { z } from 'zod';

/** Iterable list of valid attack types. */
export const attackTypes = ['melee', 'ranged'] as const;

/** The type of attack (melee or ranged). */
export type AttackType = (typeof attackTypes)[number];

/** The schema for an attack type. */
export const attackTypeSchema: z.ZodType<AttackType> = z.enum(attackTypes);
