import type { BoardSpace } from './boardSpace';
import { z } from 'zod';
import { boardSpaceSchema } from './boardSpace';

/**
 * Creates a Zod object schema for a board with all required coordinates.
 *
 * This builds a schema where each coordinate is a required key mapping to a BoardSpace.
 * By using z.object() with explicit keys (instead of z.record()), TypeScript can infer
 * the exact coordinate types rather than falling back to Record<string, BoardSpace>.
 *
 * @param coordinates - Array of coordinate strings (e.g., ["A-1", "A-2", ...])
 * @returns A ZodObject schema that validates an object with all coordinates as required keys
 *
 * The return type explicitly specifies:
 * - Shape: Record<T, z.ZodType<BoardSpace>> - each coordinate maps to a BoardSpace schema
 * - Unknown keys: "strip" - extra keys are removed during parsing
 * - Output/Input: Record<T, BoardSpace> - TypeScript infers the exact coordinate type
 */
export function createBoardCoordinateMapSchema<T extends string>(
  coordinates: readonly T[],
): z.ZodObject<Record<T, z.ZodType<BoardSpace>>> {
  const shape = {} as Record<T, z.ZodType<BoardSpace>>;
  // Ensure all coordinates are included in the schema
  for (const coord of coordinates) {
    shape[coord] = boardSpaceSchema;
  }
  // Return the schema - TypeScript will infer the correct types
  return z.object(shape);
}
