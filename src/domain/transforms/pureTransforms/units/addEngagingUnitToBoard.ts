import type { Board, EngagedUnitPresence, UnitWithPlacement } from '@entities';
import { getBoardSpace, hasSingleUnit, isFriendlyUnit } from '@queries';

/**
 * Sets an engaging unit down in the space of the enemy it engages, as the
 * first of the pair. An engaged pair keeps one facing and the other unit
 * faces opposite it, so the defender ends up facing its attacker without its
 * facing being worked out: what a flank engagement requires (§6.3.4).
 *
 * The engaging unit must already be off its start space; this only adds it.
 *
 * @param board - The board, with the defender alone in its space
 * @param engaging - The engaging unit, and the placement its move ends in
 * @returns A new board with the two engaged in that space
 * @throws Error unless the space holds exactly one unit, an enemy of the engaging unit
 */
export function addEngagingUnitToBoard(
  board: Board,
  engaging: UnitWithPlacement,
): Board {
  const { coordinate, facing } = engaging.placement;
  const space = getBoardSpace(board, coordinate);
  const presence = space.unitPresence;

  // Only a lone enemy can be engaged.
  // An engagement begins where a unit ends a step in a space held by a single
  // enemy unit (§6.1.1); an empty space, a friend's, or an engaged space
  // (§2.2.3) has no one to engage.
  if (
    !hasSingleUnit(presence) ||
    isFriendlyUnit(presence.unit, engaging.unit.playerSide)
  ) {
    throw new Error(`There is no lone enemy to engage at ${coordinate}`);
  }

  // The engaging unit keeps its facing; the defender is turned to face it.
  const engaged: EngagedUnitPresence = {
    presenceType: 'engaged',
    primaryFacing: facing,
    primaryUnit: engaging.unit,
    secondaryUnit: presence.unit,
  };
  const withPair: Board = {
    ...board,
    board: {
      ...board.board,
      [coordinate]: { ...space, unitPresence: engaged },
    },
  };

  // The board with the pair engaged in that space, every other space as it was.
  return withPair;
}
