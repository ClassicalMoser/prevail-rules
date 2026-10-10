/**
 * Ordered column numbers for the standard board (1–18), as digit strings.
 *
 * Index in this array is the column index for the standard layout. Includes
 * the small board's 1–12 and is a prefix of the large board's 1–36.
 */
export const standardBoardColumnNumbers = [
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
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
] as const;

/** One column number on a standard board. */
export type StandardBoardColumnNumber =
  (typeof standardBoardColumnNumbers)[number];
