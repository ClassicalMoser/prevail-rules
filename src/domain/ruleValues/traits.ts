import { z } from 'zod';

export const traits = [
  'formation',
  'phalanx',
  'warband',
  'skirmish',
  'cavalry',
  'chariot',
  'beast',
  'shock',
  'melee',
  'missile',
  'bow',
  'sling',
  'pike',
  'javelin',
] as const;

/**
 * A trait of a unit.
 */
export type Trait = (typeof traits)[number];

/**
 * Schema for a unit trait. Both sides derive from the `traits` tuple, so no
 * separate AssertExact drift check is needed.
 */
export const traitSchema: z.ZodType<Trait> = z.enum(traits);
