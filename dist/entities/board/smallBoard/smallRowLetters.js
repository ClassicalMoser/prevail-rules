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
];
export const smallBoardRowLettersSchema = z.enum(smallBoardRowLetters);
// assert that the type matches the schema
const _smallBoardRowLetterAssertExact = true;
