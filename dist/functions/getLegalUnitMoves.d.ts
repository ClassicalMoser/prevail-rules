import type { Board } from "src/entities/board/board.js";
import type { UnitInstance } from "src/entities/unit/unitInstance.js";
import type { UnitPlacement } from "src/entities/unitLocation/unitPlacement.js";
/**
 * Calculates all legal moves for a unit from a given starting position.
 * Uses recursive exploration with memoization to find all combinations of
 * movement and facing changes within the unit's speed and flexibility limits.
 *
 * @param unit - The unit for which to calculate legal moves
 * @param board - The board state to evaluate moves on
 * @param startingPosition - The current position and facing of the unit
 * @returns A set of all legal unit placements (coordinate + facing) the unit can reach
 * @throws {Error} If the unit is not free to move, not present, or facing mismatch
 */
export declare function getLegalUnitMoves<TBoard extends Board>(unit: UnitInstance, board: TBoard, startingPosition: UnitPlacement<TBoard>): Set<UnitPlacement<TBoard>>;
//# sourceMappingURL=getLegalUnitMoves.d.ts.map