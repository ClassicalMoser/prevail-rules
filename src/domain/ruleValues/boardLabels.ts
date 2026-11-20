/**
 * The labels a board's rows and columns carry, from the north-west corner.
 *
 * No rule depends on them (§2.1.2): the digital board labels its rows and
 * columns as a convenience, so that every space has a name. Every size labels
 * its rows from A at the north edge and its columns from 1 at the west edge,
 * so a smaller board's labels are the first of a larger board's, and the
 * sizes nest: small within standard within large. These are the large
 * board's, the widest; a size uses as many as its depth and frontage.
 */

/** Row letters, north to south (A–X). Index = row in step math. */
export const boardRowLetters = [
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

/** One row letter. */
export type BoardRowLetter = (typeof boardRowLetters)[number];

/** Column numbers as digit strings, west to east (1–36). Index = column. */
export const boardColumnNumbers = [
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
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
] as const;

/** One column number. */
export type BoardColumnNumber = (typeof boardColumnNumbers)[number];
