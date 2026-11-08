import type { UnitWithPlacement } from '@entities';
import type { MoveUnitEvent } from '@events';
import type { GameState } from '@game';
import { getLegalUnitMoves } from './getLegalUnitMoves';

/**
 * Validates whether a unit move event is legal according to game rules.
 *
 * @param moveUnitEvent - The move unit event to validate
 * @param gameState - The current game state
 * @returns True if the move is legal, false otherwise
 */
export function isLegalMove(
  moveUnitEvent: MoveUnitEvent,
  gameState: GameState,
): boolean {
  // Get the move unit event
  const { unit, to } = moveUnitEvent;
  try {
    const unitWithPlacement = unit as UnitWithPlacement;
    const legalMoves = getLegalUnitMoves(unitWithPlacement, gameState);
    // Set.has() uses reference equality, so we need to check by value
    return [...legalMoves].some(
      (move) => move.coordinate === to.coordinate && move.facing === to.facing,
    );
  } catch {
    // If getLegalUnitMoves throws (invalid starting position, etc.), the move is not legal
    // TODO(wrong): the catch also hides faults unrelated to the start
    // position, so a broken state reads as an illegal move. Settled by
    // letting `validation` own the try/catch (DESIGN.md: validation wraps
    // throwing getters), leaving this predicate to throw. See AUDIT.md `legality`.
    return false;
  }
}
