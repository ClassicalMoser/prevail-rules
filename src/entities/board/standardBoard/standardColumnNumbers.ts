/**
 * Valid column numbers for a standard board (1-18).
 */
export const standardBoardColumnNumbers = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
] as const;

/**
 * A column number on a standard board (1-18).
 */
export type StandardBoardColumnNumber =
  (typeof standardBoardColumnNumbers)[number];
