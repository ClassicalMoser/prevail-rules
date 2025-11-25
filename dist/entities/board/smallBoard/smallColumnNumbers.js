import { z } from "zod";
/**
 * Valid column numbers for a small board (1-12).
 */
export const smallBoardColumnNumbers = [
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
];
/**
 * The schema for a valid column number on a small board (1-12).
 */
export const smallBoardColumnNumbersSchema = z.enum(smallBoardColumnNumbers);
// assert that the type matches the schema
const _smallBoardColumnNumberAssertExact = true;
