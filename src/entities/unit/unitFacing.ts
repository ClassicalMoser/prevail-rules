import type { AssertExact } from '@utils';
import { z } from 'zod';

/** List of orthogonal facings. */
export const orthogonalFacings = ['north', 'east', 'south', 'west'] as const;
/** List of diagonal facings. */
export const diagonalFacings = [
  'northEast',
  'southEast',
  'southWest',
  'northWest',
] as const;

/**
 * List of valid facing directions for a unit.
 */
export const unitFacings = [...orthogonalFacings, ...diagonalFacings] as const;

/**
 * The schema for the facing direction of a unit.
 */
export const unitFacingSchema = z.enum(unitFacings);

// Helper type to check match of type against schema
type unitFacingSchemaType = z.infer<typeof unitFacingSchema>;

/**
 * The facing direction of a unit.
 */
export type UnitFacing = (typeof unitFacings)[number];

const _assertExactUnitFacing: AssertExact<UnitFacing, unitFacingSchemaType> =
  true;
