import type { AssertExact } from "../../../utils/assertExact.js";
import { z } from "zod";

/**
 * Valid row letters for a standard board (A through L).
 */
export const standardBoardRowLetters = [
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
] as const;

export const standardBoardRowLettersSchema = z.enum(standardBoardRowLetters);

// Helper type to check match of type against schema
type standardBoardRowLettersSchemaType = z.infer<
  typeof standardBoardRowLettersSchema
>;

/**
 * A row letter on the board (A-L).
 */
export type StandardBoardRowLetter = (typeof standardBoardRowLetters)[number];

// assert that the type matches the schema
const _boardRowLetterAssertExact: AssertExact<
  StandardBoardRowLetter,
  standardBoardRowLettersSchemaType
> = true;
