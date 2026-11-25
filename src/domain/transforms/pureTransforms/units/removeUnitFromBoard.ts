import type {
  Board,
  NoneUnitPresence,
  SingleUnitPresence,
  UnitWithPlacement,
} from '@entities';
import {
  getBoardSpace,
  getOppositeFacing,
  hasNoUnit,
  hasSingleUnit,
  isSameUnitInstance,
} from '@queries';
/**
 * Pure transform to remove a unit from the board immutably with no side effects.
 *
 * The shared step that lifts a unit off a bare board, used by the writers
 * that change a game state (`moveUnitOnBoard`, `moveUnitIntoEngagement`,
 * `routUnit`) and by the bot, which imagines a board without a unit. Lifted
 * from an engaged space, the unit leaves its enemy standing alone, still
 * facing the way it faced in the fight: a defender that falls back leaves the
 * engaging unit holding the space (§6.3.2), and a unit that retreats or routs
 * frees its enemy (§7.5.3).
 *
 * Only the coordinate of the placement is read; the unit is found in that
 * space by who it is, whatever facing the placement names.
 *
 * @param board - The board to lift the unit from
 * @param unit - The unit, and the space it stands in
 * @returns A new board without the unit in that space
 * @throws {Error} If the space holds no unit, or not this one
 */
export function removeUnitFromBoard(
  board: Board,
  unit: UnitWithPlacement,
): Board {
  // The space the unit is said to stand in, and who stands there.
  const coord = unit.placement.coordinate;
  const space = getBoardSpace(board, coord);
  const existingUnitPresence = space.unitPresence;

  // A unit can only be lifted from where it stands; an empty space means
  // whatever named the space was wrong.
  if (hasNoUnit(existingUnitPresence)) {
    throw new Error('Cannot remove unit from space with no unit');
  }

  // Alone in its space, the unit leaves it empty.
  if (hasSingleUnit(existingUnitPresence)) {
    // The unit standing there must be this one, matched by who it is.
    if (!isSameUnitInstance(existingUnitPresence.unit, unit.unit)) {
      throw new Error('Unit mismatch');
    }
    const newUnitPresence: NoneUnitPresence = { presenceType: 'none' };
    const newBoard = {
      ...board,
      board: {
        ...board.board,
        [coord]: {
          ...space,
          unitPresence: newUnitPresence,
        },
      },
    };

    // The board with the space empty, every other space as it was.
    return newBoard;
  }

  // Otherwise the space is engaged: the unit is one of the two locked there,
  // matched by who it is.
  const unitIsPrimary = isSameUnitInstance(
    existingUnitPresence.primaryUnit,
    unit.unit,
  );
  const unitIsSecondary = isSameUnitInstance(
    existingUnitPresence.secondaryUnit,
    unit.unit,
  );
  if (!unitIsPrimary && !unitIsSecondary) {
    throw new Error('Unit mismatch');
  }

  // The primary leaves: the secondary stays alone, facing as it faced in the
  // fight, opposite the primary.
  if (unitIsPrimary) {
    const newFacing = getOppositeFacing(existingUnitPresence.primaryFacing);
    const newUnitPresence: SingleUnitPresence = {
      facing: newFacing,
      presenceType: 'single',
      unit: existingUnitPresence.secondaryUnit,
    };
    const newBoard = {
      ...board,
      board: {
        ...board.board,
        [coord]: {
          ...space,
          unitPresence: newUnitPresence,
        },
      },
    };

    // The board with the secondary alone in the space.
    return newBoard;
  }

  // The secondary leaves: the primary stays alone, with the facing it held.
  const newUnitPresence: SingleUnitPresence = {
    facing: existingUnitPresence.primaryFacing,
    presenceType: 'single',
    unit: existingUnitPresence.primaryUnit,
  };
  const newBoard = {
    ...board,
    board: {
      ...board.board,
      [coord]: {
        ...space,
        unitPresence: newUnitPresence,
      },
    },
  };

  // The board with the primary alone in the space.
  return newBoard;
}
