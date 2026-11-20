import type { Board } from '@entities';
import { createEmptyBoard } from './createEmptyBoard';

/**
 * Creates an empty standard board with all coordinates initialized to default spaces.
 */
export function createEmptyStandardBoard(): Board {
  // The standard board's spaces, each empty.
  const board = createEmptyBoard('standard');
  return board;
}
