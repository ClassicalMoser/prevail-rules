/**
 * Ground-cover vocabulary for a board space.
 *
 * Terrain here is only surface type (open, rocks, scrub, forest).
 * This is mostly cosmetic/placeholder for now. Full buildout is in
 * roadmap doc.
 */
import { z } from 'zod';

/**
 * Closed list of valid terrain type literals.
 */
const groundCovers = [
  'road',
  'open',
  'broken',
  'ford',
  'scrub',
  'rocks',
  'mud',
  'wood',
  'crags',
  'bank',
  'marsh',
  'thicket',
] as const;

/**
 * Ground cover in a space.
 */
export type GroundCover = (typeof groundCovers)[number];

/**
 * The schema for the ground cover in a space.
 */
export const groundCoverSchema: z.ZodType<GroundCover> = z.enum(groundCovers);

// NOTE: No AssertExact here becuase it would be strictly tautological.
