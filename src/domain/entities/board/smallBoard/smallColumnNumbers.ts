/**
 * Ordered column numbers for the small board (1–12), stored as digit strings
 * so they compose cleanly into `"E-5"` coordinates.
 *
 * Order matters for column indices in the small layout. Small ⊂ standard ⊂
 * large — these columns are a prefix of the wider boards' column lists.
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

/** One column number on a small board. */
export type SmallBoardColumnNumber = (typeof smallBoardColumnNumbers)[number];
