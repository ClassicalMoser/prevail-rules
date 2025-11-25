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
];
export const largeBoardRowLettersSchema = z.enum(largeBoardRowLetters);
// assert that the type matches the schema
const _largeBoardRowLetterAssertExact = true;
