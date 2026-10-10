/**
 * Ordered row letters for the small board (A–H).
 *
 * Order matters: index in this array is the row index used by step / arc math
 * via the small layout's `getRowIndex`. Small ⊂ standard ⊂ large — these
 * letters are a prefix of the wider boards' row lists.
 */
export const smallBoardRowLetters = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
] as const;

/** One row letter on a small board. */
export type SmallBoardRowLetter = (typeof smallBoardRowLetters)[number];
