import type { Board, UnitWithPlacement } from "@entities";
import { MoveUnitEventForBoard } from "@events";
import type { GameStateForBoard } from "@game";
import { getLegalUnitMoves } from "@queries";

/**
 * Validates whether a unit move event is legal according to game rules.
 *
 * @param moveUnitEvent - The move unit event to validate
 * @param gameState - The current game state
 * @returns True if the move is legal, false otherwise
 */
export function isLegalMove<TBoard extends Board>(
  moveUnitEvent: MoveUnitEventForBoard<TBoard>,
  gameState: GameStateForBoard<TBoard>,
): boolean {
  // Get the move unit event
  const { unit, to } = moveUnitEvent;
  try {
    const unitWithPlacement = unit as UnitWithPlacement<TBoard>;
    const legalMoves = getLegalUnitMoves(unitWithPlacement, gameState);
    // Set.has() uses reference equality, so we need to check by value
    return [...legalMoves].some(
      (move) => move.coordinate === to.coordinate && move.facing === to.facing,
    );
  } catch {
    // If getLegalUnitMoves throws (invalid starting position, etc.), the move is not legal
    return false;
  }
}
