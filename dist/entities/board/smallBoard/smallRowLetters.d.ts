import { z } from "zod";
/**
 * Valid row letters for a small board (A through H).
 */
export declare const smallBoardRowLetters: readonly ["A", "B", "C", "D", "E", "F", "G", "H"];
export declare const smallBoardRowLettersSchema: z.ZodEnum<["A", "B", "C", "D", "E", "F", "G", "H"]>;
/**
 * A row letter on a small board (A-H).
 */
export type SmallBoardRowLetter = (typeof smallBoardRowLetters)[number];
//# sourceMappingURL=smallRowLetters.d.ts.map