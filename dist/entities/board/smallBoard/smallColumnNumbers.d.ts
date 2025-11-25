import { z } from "zod";
/**
 * Valid column numbers for a small board (1-12).
 */
export declare const smallBoardColumnNumbers: readonly ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
/**
 * The schema for a valid column number on a small board (1-12).
 */
export declare const smallBoardColumnNumbersSchema: z.ZodEnum<["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]>;
/**
 * A column number on a small board (1-12).
 */
export type SmallBoardColumnNumber = (typeof smallBoardColumnNumbers)[number];
//# sourceMappingURL=smallColumnNumbers.d.ts.map