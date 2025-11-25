import type { AssertExact } from "src/utils/assertExact.js";
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
] as const;

/**
 * The schema for a valid column number on a small board (1-12).
 */
export const smallBoardColumnNumbersSchema = z.enum(smallBoardColumnNumbers);

// Helper type to check match of type against schema
type smallBoardColumnNumbersSchemaType = z.infer<
  typeof smallBoardColumnNumbersSchema
>;

/**
 * A column number on a small board (1-12).
 */
export type SmallBoardColumnNumber = (typeof smallBoardColumnNumbers)[number];

// assert that the type matches the schema
const _smallBoardColumnNumberAssertExact: AssertExact<
  smallBoardColumnNumbersSchemaType,
  SmallBoardColumnNumber
> = true;
