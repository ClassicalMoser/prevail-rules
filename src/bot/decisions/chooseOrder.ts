import type {
  Command,
  CommandAllocation,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import type { IssueCommandsEvent } from '@events';
import type { LegalIssueCommands, LegalLine } from '@legality';
import type { BotContext } from './botContext';
import {
  getLegalLinesToOrder,
  getLegalUnitsForIssueCommand,
  getLegalUnitsToOrder,
} from '@legality';
import { isSameUnitInstance } from '@queries';
import { pickBest } from '@bot/appraisal';
import { createOrderAppraiser } from './appraiseOrder';

/** An order is worth giving only if it gains at least this much. */
const WORTHWHILE_ORDER = 0.5;

/**
 * The units a units command is spent on (§4.3.2): those it gains most from
 * ordering, added one at a time as the rules offer them (§4.3.4), until the
 * order is full or no unit left is worth ordering. An order worth too little
 * in all is not given.
 */
function bestUnits(command: Command, context: BotContext): UnitInstance[] {
  const { view, seat } = context;
  const appraise = createOrderAppraiser(context, command.type);
  const placed = getLegalUnitsForIssueCommand(command, seat, view);
  const placementOf = (unit: UnitInstance): UnitWithPlacement | undefined =>
    placed.find((candidate) => isSameUnitInstance(candidate.unit, unit));
  const chosen: UnitInstance[] = [];
  let worth = 0;
  for (;;) {
    const offer = getLegalUnitsToOrder(command, seat, view, chosen);
    let best: { unit: UnitInstance; worth: number } | undefined;
    for (const unit of offer.next) {
      const where = placementOf(unit);
      const unitWorth = where === undefined ? 0 : appraise(where);
      if (best === undefined || unitWorth > best.worth) {
        best = { unit, worth: unitWorth };
      }
    }
    // Stop when the order is full, or the next unit adds too little, once
    // the order names a unit.
    if (
      best === undefined ||
      (chosen.length > 0 && best.worth < WORTHWHILE_ORDER)
    ) {
      break;
    }
    chosen.push(best.unit);
    worth += best.worth;
  }
  // An order worth too little in all is not given.
  if (worth < WORTHWHILE_ORDER) {
    return [];
  }
  return chosen;
}

/**
 * The lines a lines command is spent on (§4.3.3): the best line the rules
 * offer, then the best of those left, until the card's number of lines is
 * reached or no line left is worth ordering. A line moves a whole rank at
 * once, which is how an army advances together; each is worth the sum of
 * what its units gain.
 */
function bestLines(command: Command, context: BotContext): UnitInstance[][] {
  const { view, seat } = context;
  const appraise = createOrderAppraiser(context, command.type);
  const lineWorth = (line: LegalLine): number =>
    line.units.reduce((total, unit) => total + appraise(unit), 0);
  const chosen: UnitInstance[][] = [];
  for (;;) {
    const offer = getLegalLinesToOrder(command, seat, view, chosen);
    const worthGiving = offer.next.filter(
      (line) => lineWorth(line) >= WORTHWHILE_ORDER,
    );
    // Stop when the card's lines are spent, or no line left is worth one.
    if (worthGiving.length === 0) {
      break;
    }
    const best = pickBest(
      worthGiving,
      lineWorth,
      context.temperament,
      context.random,
    );
    chosen.push(best.units.map((member) => member.unit));
  }
  return chosen;
}

/**
 * Spends the command on the card in play (§4.3), all at once. A units order
 * takes the units it gains most from moving or shooting; a lines order takes
 * its best lines. An order worth too little to give orders nobody (§4.3.2).
 *
 * @param offer - The player issuing, and the command on their card in play
 * @param context - What the bot decides from
 * @returns Its allocation of the command
 */
export function chooseOrder(
  offer: LegalIssueCommands,
  context: BotContext,
): IssueCommandsEvent {
  const { command, player } = offer;
  const allocation: CommandAllocation =
    command.size === 'lines'
      ? { allocationType: 'lines', lines: bestLines(command, context) }
      : { allocationType: 'units', units: bestUnits(command, context) };
  const event: IssueCommandsEvent = {
    allocation,
    choiceType: 'issueCommands',
    eventType: 'playerChoice',
    player,
  };
  return event;
}
