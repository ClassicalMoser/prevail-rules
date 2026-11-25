import type { UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { arrayWithoutUnit, getReservedUnit } from '@queries';
import { fileUnitInIndex } from '../gameStateIndex/fileUnitInIndex';
import { addUnitToBoard } from './addUnitToBoard';

/**
 * A unit deploys (§3.5): it leaves the reserve and is placed on the board,
 * in one write. The board, the reserve and the index change together, so no
 * state has the unit in both places. It places the reserve's own copy of the
 * unit.
 *
 * @param state - The game, the unit still in reserve
 * @param deployed - Who the unit is, and where and which way it is placed
 * @returns The state with the unit on the board, out of reserve, and filed at its space
 * @throws When the unit is not in reserve, or cannot be placed there
 */
export function deployUnit<S extends GameState>(
  state: S,
  deployed: UnitWithPlacement,
): S {
  const { placement } = deployed;

  // Only a unit still waiting in reserve can deploy, and it deploys as the
  // army brought it, whatever stats the choice named it with.
  const unit = getReservedUnit(state, deployed.unit);

  // Placed on its space, gone from the reserve, and filed where it stands.
  const written: S = {
    ...state,
    boardState: addUnitToBoard(state.boardState, { placement, unit }),
    index: fileUnitInIndex(state.index, unit, placement.coordinate),
    reservedUnits: arrayWithoutUnit(state.reservedUnits, unit),
  };

  // The game with the unit standing where it deployed.
  return written;
}
