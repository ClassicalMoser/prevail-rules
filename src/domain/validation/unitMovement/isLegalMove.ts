import type { Board, GameState } from '@entities';
import type { MoveUnitEvent } from '@events';
import { getLegalUnitMoves } from '@queries';

/**
 * Validates whether a unit move event is legal according to game rules.
 *
 * @param moveUnitEvent - The move unit event to validate
 * @param gameState - The current game state
 * @returns True if the move is legal, false otherwise
 */
export function isLegalMove<TBoard extends Board>(
  moveUnitEvent: MoveUnitEvent,
  gameState: GameState<TBoard>,
): boolean {
  // Get the move unit event
  const { unit, from, to } = moveUnitEvent;
  try {
    const legalMoves = getLegalUnitMoves(unit, gameState, from);
    // Set.has() uses reference equality, so we need to check by value
    return Array.from(legalMoves).some(
      (move) => move.coordinate === to.coordinate && move.facing === to.facing,
    );
  } catch {
    // If getLegalUnitMoves throws (invalid starting position, etc.), the move is not legal
    return false;
  }
}
