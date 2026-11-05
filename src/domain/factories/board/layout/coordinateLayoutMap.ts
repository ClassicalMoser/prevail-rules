import type { Board, CoordinateLayout, CoordinateLayoutMap } from '@entities';
import { largeCoordinateLayout } from './largeCoordinateLayout';
import { smallCoordinateLayout } from './smallCoordinateLayout';
import { standardCoordinateLayout } from './standardCoordinateLayout';

/**
 * Singleton map of the three size layouts.
 * Prefer {@link getCoordinateLayout} at call sites that already have a board.
 */
export const coordinateLayoutMap: CoordinateLayoutMap = {
  large: largeCoordinateLayout,
  small: smallCoordinateLayout,
  standard: standardCoordinateLayout,
};

/**
 * Layout for the board's current `boardType`.
 *
 * Thin lookup — no cloning. Callers use `rowLetters` / `columnNumbers` for
 * bounds and the create/index ops for geometry. The return type is the
 * unspecialized {@link CoordinateLayout} (large defaults) so callers do not
 * need a generic tied to `boardType`.
 *
 * @param board - Board whose `boardType` selects the layout
 * @returns The shared layout value for that size
 */
export function getCoordinateLayout(board: Board): CoordinateLayout {
  // The board's size is the key; every size has exactly one layout.
  const layout = coordinateLayoutMap[board.boardType];
  return layout;
}
