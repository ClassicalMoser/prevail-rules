import type {
  Board,
  NoneUnitPresence,
  SingleUnitPresence,
  UnitWithPlacement,
} from '@entities';
import { hasEngagedUnits, hasNoUnit, hasSingleUnit } from '@entities';
import { getBoardSpace, getOppositeFacing, isSameUnitInstance } from '@queries';
/* Pure transform to remove a unit from the board immutably with no side effects. */
export function removeUnitFromBoard<TBoard extends Board>(
  board: TBoard,
  unit: UnitWithPlacement<TBoard>,
): TBoard {
  const coord = unit.placement.coordinate;
  const space = getBoardSpace(board, coord);
  const existingUnitPresence = space.unitPresence;
  if (hasNoUnit(existingUnitPresence)) {
    throw new Error('Cannot remove unit from space with no unit');
  }
  if (hasSingleUnit(existingUnitPresence)) {
    if (!isSameUnitInstance(existingUnitPresence.unit, unit.unit).result) {
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
    return newBoard;
  }
  if (!hasEngagedUnits(existingUnitPresence)) {
    // Unlikely. More for typescript than runtime.
    throw new Error('Invalid unit presence');
  }

  const { result: unitIsPrimary } = isSameUnitInstance(
    existingUnitPresence.primaryUnit,
    unit.unit,
  );
  const { result: unitIsSecondary } = isSameUnitInstance(
    existingUnitPresence.secondaryUnit,
    unit.unit,
  );
  if (!unitIsPrimary && !unitIsSecondary) {
    throw new Error('Unit mismatch');
  }
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
    return newBoard;
  }
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
  return newBoard;
}
