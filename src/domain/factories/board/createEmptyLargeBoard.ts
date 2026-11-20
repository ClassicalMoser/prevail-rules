import type { Board } from '@entities';
import { createEmptyBoard } from './createEmptyBoard';

/**
 * Creates an empty large board with all coordinates initialized to default spaces.
 */
export function createEmptyLargeBoard(): Board {
  // The large board's spaces, each empty.
  const board = createEmptyBoard('large');
  return board;
}
