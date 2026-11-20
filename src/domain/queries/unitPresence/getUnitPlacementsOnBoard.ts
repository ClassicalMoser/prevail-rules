import type { Board, UnitPlacement } from '@entities';
import { getBoardCoordinates } from '../board/getBoardCoordinates';
import { getBoardSpace } from '../board/getBoardSpace';
import { getOppositeFacing } from '@queries/facings';
import { getUnitIdentityKey } from '../unit/unitEquivalence/getUnitIdentityKey';
import { hasNoUnit } from './hasNoUnit';
import { hasSingleUnit } from './hasSingleUnit';

/**
 * Each board already read, with where every unit on it stands.
 *
 * A board is never written in place: every transform returns a new one. So a
 * board's units stand where they stand for as long as that board exists, and
 * what one read of it found holds for every later question about the same
 * board. Keyed weakly, so a board no longer held by the game is let go with
 * its answers.
 */
const placementsByBoard = new WeakMap<
  Board,
  ReadonlyMap<string, UnitPlacement>
>();

/**
 * Where every unit on a board stands, by its identity (`getUnitIdentityKey`).
 *
 * Which unit stands where is asked all game long: whether a unit is within its
 * commander's inspiration range, where a mover sets off, who supports a fight.
 * Each was a walk past every space. The board is read once here, the first
 * time it is asked about, and `findPositionOfUnit` looks units up in that
 * reading.
 *
 * @param board - The board to read
 * @returns Each unit on it by identity, with its space and facing
 */
export function getUnitPlacementsOnBoard(
  board: Board,
): ReadonlyMap<string, UnitPlacement> {
  // A board read before gives the same answer again.
  const known = placementsByBoard.get(board);
  if (known !== undefined) {
    return known;
  }

  // Read every space, row by row, as the walk it replaces did. Should one unit
  // ever stand in two spaces, the first space in that order answers, as it
  // did before.
  const placements = new Map<string, UnitPlacement>();
  const placeOnce = (key: string, placement: UnitPlacement): void => {
    if (!placements.has(key)) {
      placements.set(key, placement);
    }
  };
  for (const coordinate of getBoardCoordinates(board)) {
    const { unitPresence } = getBoardSpace(board, coordinate);

    // An empty space holds nobody to find.
    if (hasNoUnit(unitPresence)) {
      continue;
    }

    // A lone unit stands as stored.
    if (hasSingleUnit(unitPresence)) {
      placeOnce(getUnitIdentityKey(unitPresence.unit), {
        coordinate,
        facing: unitPresence.facing,
      });
      continue;
    }

    // Of two engaged units the primary keeps its stored facing, and the
    // secondary faces it, directly opposite: the pair look at each other.
    placeOnce(getUnitIdentityKey(unitPresence.primaryUnit), {
      coordinate,
      facing: unitPresence.primaryFacing,
    });
    placeOnce(getUnitIdentityKey(unitPresence.secondaryUnit), {
      coordinate,
      facing: getOppositeFacing(unitPresence.primaryFacing),
    });
  }

  // Kept for the next question about this same board.
  placementsByBoard.set(board, placements);
  return placements;
}
