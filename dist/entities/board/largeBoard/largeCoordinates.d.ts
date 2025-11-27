import type { LargeBoardColumnNumber } from "./largeColumnNumbers.js";
import type { LargeBoardRowLetter } from "./largeRowLetters.js";
/**
 * A valid coordinate on a large board (A-1 through X-36).
 */
export type LargeBoardCoordinate = `${LargeBoardRowLetter}-${LargeBoardColumnNumber}`;
export declare const largeBoardCoordinates: readonly LargeBoardCoordinate[];
//# sourceMappingURL=largeCoordinates.d.ts.map