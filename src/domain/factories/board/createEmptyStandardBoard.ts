import type { Board } from '@entities';
import { createEmptyBoardWithLayout } from './createEmptyBoardWithLayout';
import { standardCoordinateLayout } from './layout';

/**
 * Creates an empty standard board with all coordinates initialized to default spaces.
 */
export function createEmptyStandardBoard(): Board {
  return createEmptyBoardWithLayout('standard', standardCoordinateLayout);
}
