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
];
export const standardBoardRowLettersSchema = z.enum(standardBoardRowLetters);
// assert that the type matches the schema
const _boardRowLetterAssertExact = true;
