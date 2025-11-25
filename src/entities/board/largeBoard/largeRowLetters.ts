import type { AssertExact } from "../../../utils/assertExact.js";
import { z } from "zod";

/**
 * Valid row letters for a large board (A through X).
 */
export const largeBoardRowLetters = [
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
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
] as const;

export const largeBoardRowLettersSchema = z.enum(largeBoardRowLetters);

// Helper type to check match of type against schema
type largeBoardRowLettersSchemaType = z.infer<
  typeof largeBoardRowLettersSchema
>;

/**
 * A row letter on a large board (A-X).
 */
export type LargeBoardRowLetter = (typeof largeBoardRowLetters)[number];

// assert that the type matches the schema
const _largeBoardRowLetterAssertExact: AssertExact<
  LargeBoardRowLetter,
  largeBoardRowLettersSchemaType
> = true;
