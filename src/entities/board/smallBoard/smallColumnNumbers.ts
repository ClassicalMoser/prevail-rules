/**
 * Valid column numbers for a small board (1-12).
 */
export const smallBoardColumnNumbers = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
] as const;

/**
 * A column number on a small board (1-12).
 */
export type SmallBoardColumnNumber = (typeof smallBoardColumnNumbers)[number];
