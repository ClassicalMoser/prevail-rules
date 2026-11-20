import type { Board, Coordinate, GridPosition } from '@entities';
import { coordinateLayoutMap } from '@entities';
import { positionByCoordinate } from './positionByCoordinate';

/**
 * Where a space sits on this board, as row and column counted from 0, or
 * `undefined` when the space is not on it.
 *
 * A space has the same row and column on every board it is on
 * (`positionByCoordinate`), so the only question this board adds is whether
 * the space is on it: a larger board's space lies past this one's last row or
 * column. Callers that know the space is there use `getGridPosition`; a step
 * that must say what is wrong with a bad space uses this and words its own
 * refusal (`findForwardSpace`).
 *
 * @param board - The board the space should be on
 * @param coordinate - The space
 * @returns Its row and column, or `undefined` when it is not on this board
 */
export function findGridPosition(
  board: Board,
  coordinate: Coordinate,
): GridPosition | undefined {
  // Its row and column, the same on every board that has it.
  const position = positionByCoordinate.get(coordinate);
  if (position === undefined) {
    return undefined;
  }

  // On this board only if it falls within this size's depth and frontage.
  const { depth, frontage } = coordinateLayoutMap[board.boardType];
  const onBoard = position.row < depth && position.column < frontage;
  const found = onBoard ? position : undefined;
  return found;
}
