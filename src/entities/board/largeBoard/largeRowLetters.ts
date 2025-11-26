/**
 * Valid row letters for a large board (A through X).
 */
export const largeBoardRowLetters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
] as const;

/**
 * A row letter on a large board (A-X).
 */
export type LargeBoardRowLetter = (typeof largeBoardRowLetters)[number];
