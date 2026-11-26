import type { Board, UnitWithPlacement } from '@entities';
import {
  createEngagedUnitPresence,
  createSingleUnitPresence,
} from '@factories';
import {
  getBoardSpace,
  getOppositeFacing,
  hasEngagedUnits,
  hasSingleUnit,
  isFriendlyUnit,
} from '@queries';
import { replaceBoardSpace } from '../board/replaceBoardSpace';

/**
 * Adds a unit to a board (pure function, returns new board).
 *
 * The shared step that sets a unit down on a bare board, used by the writers
 * that change a game state (`deployUnit`, `moveUnitOnBoard`) and by the board
 * fixtures in `@testing`. On an empty space it stands alone. In a lone enemy's
 * space, facing it, it stands engaged with that enemy: in play, that is a unit
 * still engaged set back where it stood, as a reverse that turns nobody does
 * (§7.5.5). A move into an enemy is set down by `addEngagingUnitToBoard`.
 *
 * @param board - The board to set the unit down on
 * @param unit - The unit, and the space and facing it is set down with
 * @returns A new board with the unit in that space
 * @throws {Error} If the space is engaged, holds a friendly unit, or holds an
 *   enemy the unit does not face
 */
export function addUnitToBoard(board: Board, unit: UnitWithPlacement): Board {
  // Who the unit fights for, and where and which way it is set down.
  const side = unit.unit.playerSide;
  const coord = unit.placement.coordinate;
  const { facing } = unit.placement;

  // Who already stands in that space decides what the unit can do there.
  const space = getBoardSpace(board, coord);
  const existingUnitPresence = space.unitPresence;

  // Nothing enters an engaged space until its engagement is resolved (§2.2.3).
  if (hasEngagedUnits(existingUnitPresence)) {
    throw new Error('Cannot add unit to space with engaged units');
  }

  // TODO(composition): this branch and `addEngagingUnitToBoard` both build an
  // engaged pair through `createEngagedUnitPresence`, with the roles turned
  // round: here the unit already standing is primary, there the unit arriving
  // is. Nothing reads primary as engager or defender, so the two agree on the
  // game. Settled by one order for both, or by a comment on
  // `EngagedUnitPresence` in `@entities` saying the order means nothing.
  if (hasSingleUnit(existingUnitPresence)) {
    // A space holds at most one unit; only two enemies share one (§2.2.1).
    if (isFriendlyUnit(existingUnitPresence.unit, side)) {
      throw new Error('Cannot add unit to space with friendly unit');
    }

    // Two engaged units face each other, so a unit set down with an enemy
    // must face it.
    if (existingUnitPresence.facing !== getOppositeFacing(facing)) {
      throw new Error('Engaged unit must have opposite facing');
    }

    // The two stand engaged; the pair keeps the standing unit's facing, and
    // the unit set down faces opposite it.
    const engaged = createEngagedUnitPresence(
      existingUnitPresence.unit,
      existingUnitPresence.facing,
      unit.unit,
    );
    const newBoard = replaceBoardSpace(board, coord, {
      ...space,
      unitPresence: engaged,
    });

    // The board with the two engaged in that space, every other space as it was.
    return newBoard;
  }

  // An empty space: the unit stands there alone, facing as it was set down.
  const alone = createSingleUnitPresence(unit.unit, facing);
  const newBoard = replaceBoardSpace(board, coord, {
    ...space,
    unitPresence: alone,
  });

  // The board with the unit in that space, every other space as it was.
  return newBoard;
}
