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

  // A player names a line by its two ends, in either order (§4.3.5), so the
  // pairs match end for end, or crosswise.
  const sameWay =
    isSameUnitInstance(one, otherOne) && isSameUnitInstance(other, otherOther);
  const reversed =
    isSameUnitInstance(one, otherOther) && isSameUnitInstance(other, otherOne);

  // Either reading names the one line between those two units.
  const same = sameWay || reversed;
  return same;
}

/** The ends of a line, as the units the order names. */
function endUnits(line: LegalLine): [UnitInstance, UnitInstance] {
  // An order names units by who they are, not where they stand, so the ends
  // are compared without their placements.
  const [one, other] = line.ends;
  const units: [UnitInstance, UnitInstance] = [one.unit, other.unit];

  // The two units a player names to give this line its order.
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
  // A unit takes one order a round (§4.3.6), so a unit already commanded can
  // neither anchor a line nor stand in one.
  const { commandedUnits } = gameState.currentRoundState;

  // A line is at most eight units (§4.3.5), so a stretch that takes in its
  // anchor runs no more than seven units past it on either side.
  const reach = MAX_LINE_LENGTH - 1;

  // The lines found so far, each listed once however many anchors it holds.
  const lines: LegalLine[] = [];

  // Every line holds a unit that meets the full restrictions, so every line
  // is a stretch through one of them.
  const inRange = getLegalUnitsForIssueCommand(command, player, gameState);
  for (const anchor of inRange) {
    // The unbroken rank the anchor stands in (§4.3.5): a line through the
    // anchor is a stretch of it, since the rank already stops at a gap, an
    // enemy, and a unit this order may not name.
    const rank = getLineSegmentContainingUnit(
      gameState.boardState,
      anchor,
      command.restrictions,
      commandedUnits,
    );

    // Where the anchor stands in its rank, so the stretches can be counted
    // from it. The rank was drawn through the anchor, so it always holds it.
    // TODO(composition): getLineSegmentContainingUnit builds the rank around
    // the anchor and knows where it put it, yet both this function and
    // findRankSpanBetweenEnds search the rank for it again, with a throw
    // that cannot fire. Settled by the query answering the anchor's place
    // with the rank.
    const at = throwIfUndefined(
      findUnitIndex(rank, anchor.unit),
      'A rank holds the unit it was drawn from',
    );

    // Each stretch of up to eight that takes in the anchor. It begins at the
    // anchor or up to seven units before it, never before the rank's start.
    const firstStart = Math.max(0, at - reach);
    const starts = rank.slice(firstStart, at + 1);
    for (const [startOffset, first] of starts.entries()) {
      const from = firstStart + startOffset;

      // It ends at the anchor or past it, with no more than eight units from
      // its first; the slice stops at the rank's end on its own.
      const finals = rank.slice(at, from + reach + 1);
      for (const [finalOffset, final] of finals.entries()) {
        const to = at + finalOffset;

        // The line is every unit of the rank between those two ends: an
        // order to a line commands each of them (§4.3.5).
        const units = rank.slice(from, to + 1);
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

  // Every stretch the player may name, once each. Empty when no unit meets
  // the order's full restrictions: the player then orders no line.
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
  // The two ends fix the line (§4.3.5): no two legal lines share both ends,
  // so the first match is the only one.
  const line = lines.find((candidate) => isSameLine(endUnits(candidate), ends));

  // The line those ends name, if it is legal; `undefined` sends a validator
  // to getLineRefusalReason for why not.
  return line;
}

/**
 * Whether a list of units is the whole of a legal line, in rank order from
 * either end. A line order lists every unit it orders (§4.3.5), so a list
 * that skips a unit between the ends, or adds one beyond them, is not the
 * line.
 *
 * TODO(composition): isValidIssueCommandsEvent keeps its own `isSameLine`,
 * which makes this same comparison of a list against an offered line, read
 * either way. Settled by the validator calling this one, or by this one
 * going if only the refusal reason needs it.
 *
 * @param line - The legal line the list's two ends name
 * @param units - The units the order lists
 * @returns Whether the list is that line's units, read one way or the other
 */
export function listsWholeLine(
  line: LegalLine,
  units: readonly UnitInstance[],
): boolean {
  // A list of another length cannot be the line.
  const lineUnits = line.units.map((member) => member.unit);
  if (lineUnits.length !== units.length) {
    return false;
  }

  // Read in rank order, or from the other end: a line is named from either
  // end, so its units may be listed from either. The lengths already match,
  // so `listed` is always there; the check only satisfies the type.
  const matchesInOrder = (ordered: readonly UnitInstance[]): boolean =>
    ordered.every((unit, index) => {
      const listed = units[index];
      return listed !== undefined && isSameUnitInstance(unit, listed);
    });
  const whole =
    matchesInOrder(lineUnits) || matchesInOrder(lineUnits.toReversed());

  // True only when every unit between the ends is listed, and nothing else.
  return whole;
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
    // Only a unit on the board can be ordered; one routed or never placed
    // ends no line.
    const placement = findPositionOfUnit(gameState, end);
    if (placement === undefined) {
      return `A line end is not on the board for ${player}`;
    }

    // Asked with the end's own facing, so the facing test always passes and
    // what remains is whether it is the player's and an order may name it
    // (§4.3.4, §4.3.6).
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
      // An enemy, an engaged unit, a unit already ordered, or one the
      // order's traits and types leave out.
      return 'A line end may not stand in a line under this order';
    }
  }

  // The ends must stand on one unbroken rank: shoulder to shoulder, squared
  // the same way or about-faced, with no gap, enemy or unit the order may not
  // name between them (§4.3.5).
  const span = findRankSpanBetweenEnds(
    gameState,
    ends,
    command.restrictions,
    currentRoundState.commandedUnits,
  );
  if (span === undefined) {
    // Something between them breaks the rank, or they stand in different
    // ranks altogether.
    return 'The two ends do not stand on one unbroken rank';
  }

  // A line is one to eight units, both ends counted.
  const length = span.to - span.from + 1;
  if (length > MAX_LINE_LENGTH) {
    // A rank longer than eight is ordered a stretch at a time.
    return `A line is at most ${MAX_LINE_LENGTH} units; these ends span ${length}`;
  }

  // Otherwise no unit of it meets the full restrictions. Every unit of the
  // rank already matches the traits and types, so what is left is the
  // inspiration range: none of them stands within the commander's reach
  // (§4.3.5). Asked only for ends getLegalLines did not list, so this last
  // reason is never given for a legal line.
  return 'No unit of the line is within inspiration range';
}
