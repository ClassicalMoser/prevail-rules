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
 * The facing direction of a unit.
 */
export type UnitFacing =
  | (typeof orthogonalFacings)[number]
  | (typeof diagonalFacings)[number];

/**
 * List of valid facing directions for a unit.
 */
export const unitFacings: readonly UnitFacing[] = [
  ...orthogonalFacings,
  ...diagonalFacings,
];

const _unitFacingSchemaObject = z.enum(unitFacings);
type unitFacingSchemaType = z.infer<typeof _unitFacingSchemaObject>;

/**
 * The schema for the facing direction of a unit.
 */
export const unitFacingSchema: z.ZodType<UnitFacing> = _unitFacingSchemaObject;

// Verify manual type matches schema inference
const _assertExactUnitFacing: AssertExact<UnitFacing, unitFacingSchemaType> =
  true;
