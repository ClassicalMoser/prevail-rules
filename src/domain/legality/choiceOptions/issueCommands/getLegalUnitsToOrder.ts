import type { Command, PlayerSide, UnitInstance } from '@entities';
import type { GameState } from '@game';
import type { OpenChoice } from '@utils';
import { hasUnitInArray } from '@queries';

import { getLegalUnitsForIssueCommand } from './getLegalUnitsForIssueCommand';

/**
 * The units a units order may still take, given those chosen so far, and
 * whether the player may stop choosing (§4.3.2).
 *
 * An order takes up to its printed number of eligible units: the number is a
 * ceiling, not a quota, and taking none declines the order. A unit is chosen
 * once. The choices are too many to list whole, so they are offered a unit at
 * a time, and the order they were chosen in does not matter.
 *
 * @param command - The units order being issued
 * @param player - The player issuing it
 * @param gameState - The current game state
 * @param chosenSoFar - The units chosen so far, in any order
 * @returns The units that may be chosen next, and whether choosing may stop
 */
export function getLegalUnitsToOrder(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
  chosenSoFar: readonly UnitInstance[],
): OpenChoice<UnitInstance> {
  // Once the order's number is reached, it takes nobody more (§4.3.2).
  // Every other eligible unit stays open until then, except those already
  // chosen: a unit is ordered once (§4.3.6).
  const full = chosenSoFar.length >= command.number;
  const next = full
    ? []
    : getLegalUnitsForIssueCommand(command, player, gameState)
        .map((eligible) => eligible.unit)
        .filter((unit) => !hasUnitInArray(chosenSoFar, unit));

  // The player may stop at any point; stopping before any unit declines the
  // order (§4.3.2).
  const choice: OpenChoice<UnitInstance> = {
    mayStop: true,
    next,
  };

  // The units still open to this order, and leave to stop here.
  return choice;
}

/**
 * Why the unit at a position in a submitted order was not among those
 * offered after the units before it: the rule of §4.3.2–4.3.4 it breaks, in
 * the order a player would check them.
 *
 * Asked by isValidIssueCommandsEvent after findIllegal has found the first
 * unit not offered, so it words that refusal and decides nothing itself.
 *
 * @param command - The units order being issued
 * @param submitted - Every unit the player named
 * @param index - The position of the unit that was not offered
 * @returns The reason, for a refusal
 */
export function getUnitsOrderRefusalReason(
  command: Command,
  submitted: readonly UnitInstance[],
  index: number,
): string {
  // The units named before the one refused, which were all offered, and the
  // refused unit itself. An index past the list names no unit, and asking
  // why it was refused is the caller's mistake.
  const chosenSoFar = submitted.slice(0, index);
  const unit = submitted[index];
  if (unit === undefined) {
    throw new Error(`No unit at position ${index}`);
  }

  // A unit is ordered once (§4.3.6). Asked first, so a unit named twice is
  // refused as a repeat even when the second naming also passes the number.
  if (hasUnitInArray(chosenSoFar, unit)) {
    return 'Duplicate units in issue command selection';
  }

  // The printed number is a ceiling (§4.3.2): once that many are chosen, a
  // further unit is one too many.
  if (chosenSoFar.length >= command.number) {
    return `Expected at most ${command.number} units, got ${submitted.length}`;
  }

  // Otherwise the unit fails the order's restrictions, or is already
  // ordered or engaged.
  return 'Unit is not eligible for this command under its restrictions';
}
