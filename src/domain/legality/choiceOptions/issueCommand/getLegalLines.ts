import type {
  Command,
  PlayerSide,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import type { GameState } from '@game';
import {
  canJoinLine,
  findPositionOfUnit,
  findRankSpanBetweenEnds,
  findUnitIndex,
  getLineSegmentContainingUnit,
  getOppositeFacing,
  isSameUnitInstance,
} from '@queries';
import { MAX_LINE_LENGTH } from '@ruleValues';
import { throwIfUndefined } from '@utils';

import { getLegalUnitsForIssueCommand } from './getLegalUnitsForIssueCommand';

/** A line that may be ordered, and the units it commands. */
export interface LegalLine {
  /** Its two ends, in rank order; the same unit twice for a line of one. */
  ends: [UnitWithPlacement, UnitWithPlacement];
  /** Every unit of the line, in rank order. */
  units: UnitWithPlacement[];
}

/** Whether two pairs of ends name the same line, in either order. */
function isSameLine(
  ends: readonly [UnitInstance, UnitInstance],
  otherEnds: readonly [UnitInstance, UnitInstance],
): boolean {
  const [one, other] = ends;
  const [otherOne, otherOther] = otherEnds;
  const sameWay =
    isSameUnitInstance(one, otherOne) && isSameUnitInstance(other, otherOther);
  const reversed =
    isSameUnitInstance(one, otherOther) && isSameUnitInstance(other, otherOne);
  return sameWay || reversed;
}

/** The ends of a line, as the units the order names. */
function endUnits(line: LegalLine): [UnitInstance, UnitInstance] {
  const [one, other] = line.ends;
  const units: [UnitInstance, UnitInstance] = [one.unit, other.unit];
  return units;
}

/**
 * Every line a lines order may be given to (§4.3.5): any unbroken stretch of
 * one to eight units of a rank, every unit matching the order's traits and
 * types, with at least one of them meeting its full restrictions, inspiration
 * range included. That unit may stand anywhere in the line, an end or the
 * middle. Nothing obliges the player to take the whole rank, or the longest
 * stretch they could.
 *
 * A line is fixed by its two ends, so the lines are few enough to list whole.
 *
 * @param command - The lines order being issued
 * @param player - The player issuing it
 * @param gameState - The current game state
 * @returns Each line once, by its ends in rank order
 */
export function getLegalLines(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
): LegalLine[] {
  const { commandedUnits } = gameState.currentRoundState;
  const reach = MAX_LINE_LENGTH - 1;
  const lines: LegalLine[] = [];

  // Every line holds a unit that meets the full restrictions, so every line
  // is a stretch through one of them.
  const inRange = getLegalUnitsForIssueCommand(command, player, gameState);
  for (const anchor of inRange) {
    const rank = getLineSegmentContainingUnit(
      gameState.boardState,
      anchor,
      command.restrictions,
      commandedUnits,
    );
    const at = throwIfUndefined(
      findUnitIndex(rank, anchor.unit),
      'A rank holds the unit it was drawn from',
    );

    // Each stretch of up to eight that takes in the anchor.
    for (let from = Math.max(0, at - reach); from <= at; from += 1) {
      const last = Math.min(rank.length - 1, from + reach);
      for (let to = at; to <= last; to += 1) {
        const units = rank.slice(from, to + 1);
        const first = units.at(0);
        const final = units.at(-1);
        if (first === undefined || final === undefined) {
          throw new Error('A stretch of a rank holds no units');
        }
        const line: LegalLine = { ends: [first, final], units };
        // A stretch through two anchors is still one line.
        const listed = lines.some((known) =>
          isSameLine(endUnits(known), endUnits(line)),
        );
        if (!listed) {
          lines.push(line);
        }
      }
    }
  }

  return lines;
}

/**
 * The legal line a pair of ends names, in either order.
 *
 * @param lines - The legal lines
 * @param ends - The two ends a player named
 * @returns That line, or `undefined` when the ends name no legal line
 */
export function findLegalLine(
  lines: readonly LegalLine[],
  ends: readonly [UnitInstance, UnitInstance],
): LegalLine | undefined {
  const line = lines.find((candidate) => isSameLine(endUnits(candidate), ends));
  return line;
}

/**
 * Why a pair of ends names no legal line: the rule of §4.3.5 it breaks, in
 * the order a player would check them.
 *
 * @param command - The lines order being issued
 * @param player - The player issuing it
 * @param gameState - The current game state
 * @param ends - The two ends a player named
 * @returns The reason, for a refusal
 */
export function getLineRefusalReason(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
  ends: readonly [UnitInstance, UnitInstance],
): string {
  const { boardState: board, currentRoundState } = gameState;
  // Each end must be one of the player's units able to stand in this line:
  // free of an engagement, not yet ordered, and matching the order's traits
  // and types.
  for (const end of ends) {
    const placement = findPositionOfUnit(board, end);
    if (placement === undefined) {
      return `A line end is not on the board for ${player}`;
    }
    const standing = canJoinLine(
      board,
      placement.coordinate,
      player,
      placement.facing,
      getOppositeFacing(placement.facing),
      command.restrictions,
      currentRoundState.commandedUnits,
    );
    if (standing === undefined) {
      return 'A line end may not stand in a line under this order';
    }
  }

  // The ends must stand on one unbroken rank.
  const span = findRankSpanBetweenEnds(
    board,
    ends,
    command.restrictions,
    currentRoundState.commandedUnits,
  );
  if (span === undefined) {
    return 'The two ends do not stand on one unbroken rank';
  }

  // A line is one to eight units.
  const length = span.to - span.from + 1;
  if (length > MAX_LINE_LENGTH) {
    return `A line is at most ${MAX_LINE_LENGTH} units; these ends span ${length}`;
  }

  // Otherwise no unit of it meets the full restrictions.
  return 'No unit of the line is within inspiration range';
}
