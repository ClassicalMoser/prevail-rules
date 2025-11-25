import type { AssertExact } from "../../../utils/assertExact.js";
import { z } from "zod";

/**
 * Valid row letters for a small board (A through H).
 */
export const smallBoardRowLetters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
] as const;

export const smallBoardRowLettersSchema = z.enum(smallBoardRowLetters);

// Helper type to check match of type against schema
type smallBoardRowLettersSchemaType = z.infer<
  typeof smallBoardRowLettersSchema
>;

/**
 * A row letter on a small board (A-H).
 */
export type SmallBoardRowLetter = (typeof smallBoardRowLetters)[number];

// assert that the type matches the schema
const _smallBoardRowLetterAssertExact: AssertExact<
  SmallBoardRowLetter,
  smallBoardRowLettersSchemaType
> = true;
