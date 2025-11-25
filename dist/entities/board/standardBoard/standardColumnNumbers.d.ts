import { z } from "zod";
/**
 * Valid column numbers for a standard board (1-18).
 */
export declare const standardBoardColumnNumbers: readonly [
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
];
/**
 * The schema for a valid column number on a standard board (1-18).
 */
export declare const standardBoardColumnNumbersSchema: z.ZodEnum<
  [
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
  ]
>;
/**
 * A column number on a standard board (1-18).
 */
export type StandardBoardColumnNumber =
  (typeof standardBoardColumnNumbers)[number];
//# sourceMappingURL=standardColumnNumbers.d.ts.map
