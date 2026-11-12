import type { Command, UnitInstance, UnitWithPlacement } from '@entities';
import type {
  DoneIssuingCommandsEvent,
  IssueCommandEvent,
  OrderSelection,
} from '@events';
import type { LegalIssueCommands } from '@legality';
import type { BotContext } from './botContext';
import {
  getLegalLines,
  getLegalUnitsForIssueCommand,
  getLegalUnitsToOrder,
} from '@legality';
import { isSameUnitInstance } from '@queries';
import { pickBest } from '@bot/appraisal';
import { createOrderAppraiser } from './appraiseOrder';

/** An order is worth giving only if it gains at least this much. */
const WORTHWHILE_ORDER = 0.5;

/** One order the bot could give, and what it thinks it is worth. */
interface CandidateOrder {
  command: Command;
  selection: OrderSelection;
  worth: number;
}

/**
 * The best unit-by-unit order under one command: the units it gains most from
 * ordering, added one at a time as the rules offer them (§4.3.4), until the
 * order is full or no unit left is worth ordering.
 */
function bestUnitsOrder(
  command: Command,
  context: BotContext,
): CandidateOrder | undefined {
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
    // Stop when the order is full, or the next unit adds nothing, as long as
    // the order already names a unit.
    if (
      best === undefined ||
      (offer.mayStop && best.worth < WORTHWHILE_ORDER)
    ) {
      break;
    }
    chosen.push(best.unit);
    worth += best.worth;
  }
  if (chosen.length === 0) {
    return undefined;
  }
  const candidate: CandidateOrder = {
    command,
    selection: { selectionType: 'units', units: chosen },
    worth,
  };
  return candidate;
}

/**
 * Every line order open under one command (§4.3.5), each worth the sum of
 * what its units gain. A line moves a whole rank at once, which is how an
 * army advances together.
 */
function lineOrders(command: Command, context: BotContext): CandidateOrder[] {
  const { view, seat } = context;
  const appraise = createOrderAppraiser(context, command.type);
  const candidates = getLegalLines(command, seat, view).map((line) => {
    const worth = line.units.reduce((total, unit) => total + appraise(unit), 0);
    const candidate: CandidateOrder = {
      command,
      selection: {
        ends: [line.ends[0].unit, line.ends[1].unit],
        selectionType: 'line',
      },
      worth,
    };
    return candidate;
  });
  return candidates;
}

/**
 * Gives the next order from the card in play (§4.3), or stops giving orders.
 * Every order the card still allows is weighed: for a move order, how much
 * better placed its units would be; for a shoot order, how hard they could
 * hit. The bot gives the best, and stops when no order is worth giving and
 * the rules let it stop (§4.3.3).
 *
 * @param offer - The commands it may still give
 * @param canStop - Whether it may stop giving orders now
 * @param context - What the bot decides from
 * @returns The order it gives, or its word that it is done
 */
export function chooseOrder(
  offer: LegalIssueCommands,
  canStop: boolean,
  context: BotContext,
): IssueCommandEvent | DoneIssuingCommandsEvent {
  const candidates: CandidateOrder[] = [];
  for (const command of offer.commands) {
    if (command.size === 'lines') {
      candidates.push(...lineOrders(command, context));
    } else {
      const units = bestUnitsOrder(command, context);
      if (units !== undefined) {
        candidates.push(units);
      }
    }
  }
  const done: DoneIssuingCommandsEvent = {
    choiceType: 'doneIssuingCommands',
    eventType: 'playerChoice',
    player: offer.player,
  };
  const worthGiving = candidates.filter(
    (candidate) => candidate.worth >= WORTHWHILE_ORDER,
  );
  // Nothing worth ordering: stop, if the rules allow it; if they do not, the
  // least bad order will have to do.
  let pool: CandidateOrder[] = worthGiving;
  if (pool.length === 0 && !canStop) {
    pool = candidates;
  }
  if (pool.length === 0) {
    if (!canStop) {
      throw new Error(
        `${offer.player} must give an order and has none to give`,
      );
    }
    return done;
  }
  const best = pickBest(
    pool,
    (candidate) => candidate.worth,
    context.temperament,
    context.random,
  );
  const event: IssueCommandEvent = {
    choiceType: 'issueCommand',
    command: best.command,
    eventType: 'playerChoice',
    player: offer.player,
    selection: best.selection,
  };
  return event;
}
