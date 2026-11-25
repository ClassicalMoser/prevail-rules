import type { Command, PlayerSide, UnitInstance } from '@entities';
import type { GameState } from '@game';
import type { OpenChoice } from '@utils';
import type { LegalLine } from './getLegalLines';
import { hasUnitInArray } from '@queries';

import {
  findLegalLine,
  getLegalLines,
  getLineRefusalReason,
  listsWholeLine,
} from './getLegalLines';

/** Whether a line takes in any unit of the lines already chosen. */
function overlapsChosen(
  units: readonly UnitInstance[],
  chosenSoFar: readonly (readonly UnitInstance[])[],
): boolean {
  // A unit is ordered once a round (§4.3.6), so a unit already in a chosen
  // line can be in no other.
  const overlaps = units.some((unit) =>
    chosenSoFar.some((chosen) => hasUnitInArray(chosen, unit)),
  );

  // True when the line would order a unit a second time.
  return overlaps;
}

/**
 * The lines a lines order may still take, given those chosen so far, and
 * whether the player may stop choosing (§4.3.3).
 *
 * A lines command is that many separate orders, each given to one line; the
 * player may stop after fewer, or before any, and forfeits the rest. A unit
 * is ordered once a round, so no line may take in a unit of a line already
 * chosen, nor be drawn through one (§4.3.6). The choices are too many to list
 * whole, so they are offered a line at a time, and the order the lines were
 * chosen in does not matter.
 *
 * @param command - The lines command being spent
 * @param player - The player issuing it
 * @param gameState - The current game state
 * @param chosenSoFar - The lines chosen so far, each listed unit by unit
 * @returns The lines that may be chosen next, and whether choosing may stop
 */
export function getLegalLinesToOrder(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
  chosenSoFar: readonly (readonly UnitInstance[])[],
): OpenChoice<LegalLine> {
  // Once the card's number of lines is reached, it orders no more (§4.3.3).
  // Until then, every legal line clear of the lines chosen stays open. The
  // chosen lines are not yet among the round's commanded units, so a line
  // drawn through one is caught here, by its units, rather than by the rank.
  const full = chosenSoFar.length >= command.number;
  const next = full
    ? []
    : getLegalLines(command, player, gameState).filter(
        (line) =>
          !overlapsChosen(
            line.units.map((member) => member.unit),
            chosenSoFar,
          ),
      );

  // The player may stop at any point, forfeiting the lines left.
  const choice: OpenChoice<LegalLine> = { mayStop: true, next };

  // The lines still open to this command, and leave to stop here.
  return choice;
}

/**
 * Why the line at a position in a submitted lines order was not among those
 * offered after the lines before it: the rule of §4.3.3–4.3.6 it breaks, in
 * the order a player would check them.
 *
 * Asked by isValidIssueCommandsEvent after findIllegal has found the first
 * line not offered, so it words that refusal and decides nothing itself.
 *
 * @param command - The lines command being spent
 * @param player - The player issuing it
 * @param gameState - The current game state
 * @param submitted - Every line the player named, each unit by unit
 * @param index - The position of the line that was not offered
 * @returns The reason, for a refusal
 */
export function getLinesOrderRefusalReason(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
  submitted: readonly (readonly UnitInstance[])[],
  index: number,
): string {
  // The lines named before the one refused, which were all offered, and the
  // refused line itself. An index past the list names no line, and asking
  // why it was refused is the caller's mistake.
  const chosenSoFar = submitted.slice(0, index);
  const units = submitted[index];
  if (units === undefined) {
    throw new Error(`No line at position ${index}`);
  }

  // The printed number is a ceiling (§4.3.3): once that many lines are
  // chosen, a further line is one too many.
  if (chosenSoFar.length >= command.number) {
    return `Expected at most ${command.number} lines, got ${submitted.length}`;
  }

  // A line holds at least one unit (§4.3.5); its first and last listed units
  // are the ends that name it.
  const first = units.at(0);
  const last = units.at(-1);
  if (first === undefined || last === undefined) {
    return 'A line lists at least one unit';
  }

  // A unit is ordered once (§4.3.6), so no unit of a chosen line may be
  // listed again.
  if (overlapsChosen(units, chosenSoFar)) {
    return 'A line takes in a unit already ordered by another line';
  }

  // Its two ends must name a line that may be ordered (§4.3.5); if they do
  // not, the line's own rules say why.
  const ends: [UnitInstance, UnitInstance] = [first, last];
  const legalLines = getLegalLines(command, player, gameState);
  const line = findLegalLine(legalLines, ends);
  if (line === undefined) {
    const lineRefusal = getLineRefusalReason(command, player, gameState, ends);
    return lineRefusal;
  }

  // Otherwise the list is not the whole of that line: an order to a line
  // commands every unit between its ends, with none skipped or added.
  if (!listsWholeLine(line, units)) {
    return 'The units listed are not every unit of the line between its ends, in rank order';
  }

  // A line that passes every check was offered, so asking why it was refused
  // is the caller's mistake.
  throw new Error('The line was offered, so it has no refusal reason');
}
