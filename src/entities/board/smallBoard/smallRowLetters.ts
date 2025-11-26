/**
 * Valid row letters for a small board (A through H).
 */
export const smallBoardRowLetters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
] as const;

/**
 * A row letter on a small board (A-H).
 */
export type SmallBoardRowLetter = (typeof smallBoardRowLetters)[number];
