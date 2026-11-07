import { z } from 'zod';

/** Unit traits a card restriction or unit type may list. */
export const traits = [
  'javelin',
  'melee',
  'missile',
  'shock',
  'beast',
  'chariot',
  'cavalry',
  'skirmisher',
  'phalanx',
  'warband',
  'formation',
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
