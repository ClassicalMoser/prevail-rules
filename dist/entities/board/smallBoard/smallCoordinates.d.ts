import type { SmallBoardColumnNumber } from "./smallColumnNumbers.js";
import type { SmallBoardRowLetter } from "./smallRowLetters.js";
/**
 * A valid coordinate on a small board (A-1 through H-12).
 */
export type SmallBoardCoordinate = `${SmallBoardRowLetter}-${SmallBoardColumnNumber}`;
export declare const smallBoardCoordinates: readonly SmallBoardCoordinate[];
//# sourceMappingURL=smallCoordinates.d.ts.map