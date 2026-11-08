import type { Board } from '@entities';
import { createEmptyBoardWithLayout } from './createEmptyBoardWithLayout';
import { largeCoordinateLayout } from './layout';

/**
 * Creates an empty large board with all coordinates initialized to default spaces.
 */
export function createEmptyLargeBoard(): Board {
  return createEmptyBoardWithLayout('large', largeCoordinateLayout);
}
