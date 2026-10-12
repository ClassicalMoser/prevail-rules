import { z } from 'zod';

export const traits = [
  'bow',
  'sling',
  'javelin',
  'pike',
  'melee',
  'missile',
  'shock',
  'beast',
  'chariot',
  'cavalry',
  'skirmisher',
  'phalanx',
  'formation',
  'warband',
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
