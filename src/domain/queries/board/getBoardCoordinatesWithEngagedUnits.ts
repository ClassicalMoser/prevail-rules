import type { Board } from '@entities';
import type { Coordinate } from '@ruleValues';
import { getBoardCoordinates } from './getBoardCoordinates';
import { getBoardSpace } from './getBoardSpace';
import { hasEngagedUnits } from '@queries/unitPresence';

/**
 * Returns every board coordinate whose space has engaged units.
 *
 * Every engaged space fights in Phase 4 (§4.4.1), and the first player picks
 * the order (§4.4.2). When orders end, `generateCompleteIssueCommandsPhaseEvent`
 * records these spaces as the fights still to come.
 *
 * TODO(composition): this reads every space of the board. The game state's
 * `index` already files each unit under its space, and an engaged space is
 * one filed twice; settle whether this should take the state and read that.
 */
export function getBoardCoordinatesWithEngagedUnits(
  board: Board,
): Set<Coordinate> {
  const engagements = new Set<Coordinate>();
  const coordinates = getBoardCoordinates(board);

  for (const coordinate of coordinates) {
    // Two enemy units sharing a space are a fight still to be fought (§6.1);
    // a lone unit or an empty space is not.
    const space = getBoardSpace(board, coordinate);
    if (hasEngagedUnits(space.unitPresence)) {
      engagements.add(coordinate);
    }
  }

  // Every engaged space, found in board order.
  return engagements;
}
