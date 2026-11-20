import type { Board } from '@entities';
import { createEmptyBoard } from './createEmptyBoard';

/**
 * Creates an empty small board with all coordinates initialized to default spaces.
 */
export function createEmptySmallBoard(): Board {
  // The small board's spaces, each empty.
  const board = createEmptyBoard('small');
  return board;
}
