/**
 * Ordered row letters for the standard board (A–L).
 *
 * Index in this array is the row index for the standard layout. Includes the
 * small board's A–H and is a prefix of the large board's A–X.
 */
export const standardBoardRowLetters = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
] as const;

/** One row letter on a standard board. */
export type StandardBoardRowLetter = (typeof standardBoardRowLetters)[number];
