import type { Board } from '@entities';
import { createEmptyBoardWithLayout } from './createEmptyBoardWithLayout';
import { smallCoordinateLayout } from './layout';

/**
 * Creates an empty small board with all coordinates initialized to default spaces.
 */
export function createEmptySmallBoard(): Board {
  return createEmptyBoardWithLayout('small', smallCoordinateLayout);
}
