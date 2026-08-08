import type { ValidationResult } from '@utils';
import type { MoveUnitEvent } from '@events';
import type { GameState } from '@game';
import { getLegalMoveUnits, isLegalMove } from '@legality';
import { getBoardSpace, isSameUnitInstance } from '@queries';

/**
 * Validates a MoveUnitEvent as an integral commit over:
 * - {@link getLegalMoveUnits} (player + eligible unit atoms)
 * - {@link isLegalMove} / {@link getLegalUnitMoves} (destination)
 * - `moveCommander` only when the player's commander shares the unit's space
 */
export function isValidMoveUnitEvent(
  event: MoveUnitEvent,
  state: GameState,
): ValidationResult {
  try {
    const legal = getLegalMoveUnits(state);
    if (legal === null) {
      return {
        errorReason: 'Move unit is not expected in the current state',
        result: false,
      };
    }

    if (event.player !== legal.player) {
      return {
        errorReason: `Expected move unit from ${legal.player}, got ${event.player}`,
        result: false,
      };
    }

    const matchingUnit = legal.units.find(
      (candidate) =>
        isSameUnitInstance(candidate.unit, event.unit.unit).result &&
        candidate.placement.coordinate === event.unit.placement.coordinate &&
        candidate.placement.facing === event.unit.placement.facing,
    );
    if (matchingUnit === undefined) {
      return {
        errorReason: `Unit is not a legal move candidate for ${event.player}`,
        result: false,
      };
    }

    if (!isLegalMove(event, state)) {
      return {
        errorReason: `Destination ${event.to.coordinate}/${event.to.facing} is not a legal move`,
        result: false,
      };
    }

    if (event.moveCommander) {
      const space = getBoardSpace(
        state.boardState,
        event.unit.placement.coordinate,
      );
      if (!space.commanders.includes(event.player)) {
        return {
          errorReason: `Cannot move commander with unit: commander not at ${event.unit.placement.coordinate}`,
          result: false,
        };
      }
    }

    return { result: true };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
