/**
 * Valid row letters for a standard board (A through L).
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

/**
 * A row letter on a standard board (A-L).
 */
export type StandardBoardRowLetter = (typeof standardBoardRowLetters)[number];
