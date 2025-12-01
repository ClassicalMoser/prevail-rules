import type { Board } from "src/entities/board/board.js";
import type { UnitInstance } from "src/entities/unit/unitInstance.js";
import type { UnitPlacement } from "src/entities/unitLocation/unitPlacement.js";
export declare function getLegalUnitMoves<TBoard extends Board>(unit: UnitInstance, board: TBoard, startingPosition: UnitPlacement<TBoard>): Set<UnitPlacement<TBoard>>;
//# sourceMappingURL=getLegalUnitMoves.d.ts.map