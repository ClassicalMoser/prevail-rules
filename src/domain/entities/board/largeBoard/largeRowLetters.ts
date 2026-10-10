/**
 * Ordered row letters for the large board (A–X).
 *
 * Widest row set; small and standard rows are prefixes of this list. Index in
 * this array is the row index for the large layout.
 */
export const largeBoardRowLetters = [
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
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
] as const;

/** One row letter on a large board. */
export type LargeBoardRowLetter = (typeof largeBoardRowLetters)[number];
