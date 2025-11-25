import type { AssertExact } from "src/utils/assertExact.js";
import { z } from "zod";

/**
 * Valid column numbers for a large board (1-36).
 */
export const largeBoardColumnNumbers = [
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
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
] as const;

/**
 * The schema for a valid column number on a large board (1-36).
 */
export const largeBoardColumnNumbersSchema = z.enum(largeBoardColumnNumbers);

// Helper type to check match of type against schema
type largeBoardColumnNumbersSchemaType = z.infer<
  typeof largeBoardColumnNumbersSchema
>;

/**
 * A column number on a large board (1-36).
 */
export type LargeBoardColumnNumber = (typeof largeBoardColumnNumbers)[number];

// assert that the type matches the schema
const _largeBoardColumnNumberAssertExact: AssertExact<
  largeBoardColumnNumbersSchemaType,
  LargeBoardColumnNumber
> = true;
