import type { StandardBoardColumnNumber } from "./standardColumnNumbers.js";
import type { StandardBoardRowLetter } from "./standardRowLetters.js";
/**
 * A valid coordinate on a standard board (A-1 through L-18).
 */
export type StandardBoardCoordinate = `${StandardBoardRowLetter}-${StandardBoardColumnNumber}`;
export declare const standardBoardCoordinates: readonly StandardBoardCoordinate[];
//# sourceMappingURL=standardCoordinates.d.ts.map