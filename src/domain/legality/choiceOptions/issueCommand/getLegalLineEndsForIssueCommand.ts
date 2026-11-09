import type { Command, PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { getLineSegmentContainingUnit, isSameUnitInstance } from '@queries';
import { MAX_LINE_LENGTH } from '@ruleValues';

import { getLegalLineStartsForIssueCommand } from './getLegalUnitsForIssueCommand';

/**
 * The ends a line may run to from a chosen start (§4.3.5). A line is named
 * by its two ends; the start must meet the order's full restrictions,
 * inspiration range included, and the line runs along the unbroken rank
 * containing it. Every unit within seven places of the start, either way
 * along that rank, is an end: a line is 1 to 8 units, and in a rank longer
 * than eight the player chooses which eight (A7). The start itself is always
 * an end, a line of one.
 *
 * The rank is {@link getLineSegmentContainingUnit}, the one statement of
 * who qualifies: friendly, facing the line's way or its opposite, matching
 * the order's traits and types, not yet commanded, and not engaged.
 *
 * @param command - The order being issued
 * @param player - The player issuing it
 * @param gameState - The current game state
 * @param start - The end named first
 * @returns The units the line may end on, in rank order; empty when `start` is not a legal start
 */
export function getLegalLineEndsForIssueCommand(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
  start: UnitWithPlacement,
): UnitWithPlacement[] {
  // The end named first must meet the order's full restrictions.
  const legalStarts = getLegalLineStartsForIssueCommand(
    command,
    player,
    gameState,
  );
  const startOk = legalStarts.some(
    (candidate) =>
      isSameUnitInstance(candidate.unit, start.unit).result &&
      candidate.placement.coordinate === start.placement.coordinate,
  );
  if (!startOk) {
    const none: UnitWithPlacement[] = [];
    return none;
  }

  // The unbroken rank through the start.
  const rank = getLineSegmentContainingUnit(
    gameState.boardState,
    start,
    command.restrictions,
    gameState.currentRoundState.commandedUnits,
  );
  const startIndex = rank.findIndex(
    (member) => isSameUnitInstance(member.unit, start.unit).result,
  );

  // Any end that keeps the line to eight units, start included.
  const reach = MAX_LINE_LENGTH - 1;
  const ends = rank.filter(
    (_member, index) => Math.abs(index - startIndex) <= reach,
  );
  return ends;
}
