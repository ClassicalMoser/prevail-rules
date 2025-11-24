import type { AssertExact } from "../../../assertExact.js";
import { z } from "zod";

/**
 * Valid row letters for the board (A through L).
 */
export const boardRowLetters = [
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

export const boardRowLettersSchema = z.enum(boardRowLetters);

// Helper type to check match of type against schema
type boardRowLettersSchemaType = z.infer<typeof boardRowLettersSchema>;

/**
 * A row letter on the board (A-L).
 */
export type BoardRowLetter = (typeof boardRowLetters)[number];

// assert that the type matches the schema
const _boardRowLetterAssertExact: AssertExact<
  BoardRowLetter,
  boardRowLettersSchemaType
> = true;
