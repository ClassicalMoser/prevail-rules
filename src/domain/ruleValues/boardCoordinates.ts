import type { BoardColumnNumber, BoardRowLetter } from './boardLabels';
import { z } from 'zod';
import { coordinateLayoutMap } from './boardLayouts';

/**
 * The name of a space on some board (`"A-1"` … `"X-36"`): a row letter joined
 * to a column number. Because the sizes nest, every smaller board's spaces are
 * among these, so one type names a space on any board.
 */
export type Coordinate = `${BoardRowLetter}-${BoardColumnNumber}`;

/**
 * Every space on some board, row by row from the north-west corner. The large
 * board uses every label, and every smaller board's spaces are among its
 * spaces, so its spaces are all of them.
 */
export const allCoordinates: readonly Coordinate[] =
  coordinateLayoutMap.large.coordinates;

/**
 * Schema for a space on some board, whichever size is in play. Both sides
 * derive from {@link allCoordinates}, so no separate AssertExact drift check
 * is needed.
 */
export const coordinateSchema: z.ZodType<Coordinate> = z.enum(allCoordinates);
