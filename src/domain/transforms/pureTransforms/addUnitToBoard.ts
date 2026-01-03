import type {
  Board,
  EngagedUnitPresence,
  SingleUnitPresence,
  UnitWithPlacement,
} from '@entities';
import { getBoardSpace, getOppositeFacing, isFriendlyUnit } from '@queries';
import { hasEngagedUnits, hasSingleUnit } from '@validation';

/**
 * Adds a unit to a board (pure function, returns new board).
 */
export function addUnitToBoard<TBoard extends Board>(
  board: TBoard,
  unit: UnitWithPlacement<TBoard>,
): TBoard {
  const side = unit.unit.playerSide;
  const coord = unit.placement.coordinate;
  const facing = unit.placement.facing;
  const space = getBoardSpace(board, coord);
  const existingUnitPresence = space.unitPresence;
  if (hasEngagedUnits(existingUnitPresence)) {
    throw new Error('Cannot add unit to space with engaged units');
  }
  if (hasSingleUnit(existingUnitPresence)) {
    if (isFriendlyUnit(existingUnitPresence.unit, side)) {
      throw new Error('Cannot add unit to space with friendly unit');
    }
    if (existingUnitPresence.facing !== getOppositeFacing(facing)) {
      throw new Error('Engaged unit must have opposite facing');
    }
    const newUnitPresence: EngagedUnitPresence = {
      presenceType: 'engaged',
      primaryUnit: existingUnitPresence.unit,
      primaryFacing: existingUnitPresence.facing,
      secondaryUnit: unit.unit,
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
    presenceType: 'single',
    unit: unit.unit,
    facing,
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
