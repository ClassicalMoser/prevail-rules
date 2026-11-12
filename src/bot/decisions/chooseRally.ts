import type {
  AssignUnitSupportEvent,
  ChooseRallyEvent,
  UnitSupportAssignment,
} from '@events';
import type { LegalAssignUnitSupport } from '@legality';
import type { BotContext } from './botContext';
import { getLegalUnitSupportAssignments } from '@legality';
import { getOwnedPlayerCardState } from '@queries';
import { CARD_WORTH, lossFromResult } from '@bot/appraisal';

/** The hand size below which even a spendthrift bot rallies. */
const FEWEST_CARDS_TO_HOLD = 2;

/**
 * Decides whether to rally at Cleanup (§10.3). Rallying is the only way to
 * win cards back, and a hand that runs out loses (§11.1), so a bot rallies
 * once its hand runs low; a thrifty one rallies sooner. Against that, a rally
 * burns one card for good and puts the army to the support check (§10.4):
 * every unit the cards cannot hold routs, and its Morale is paid in cards. A
 * bot that would lose more to the check than it wins back holds off.
 *
 * @param offers - Rally or not
 * @param context - What the bot decides from
 * @returns Its decision
 */
export function chooseRally(
  offers: readonly ChooseRallyEvent[],
  context: BotContext,
): ChooseRallyEvent {
  const { view, seat, survey, temperament } = context;
  const owned = getOwnedPlayerCardState(view.cardState, seat);
  const returning = owned.played.length + owned.discarded.length;
  // One returning card is burnt (§10.3.2), so a rally nets one less.
  const regained = Math.max(0, returning - 1);
  // The cards it would hold after the rally, and how many units they steady.
  // Every card counts toward support wherever it was (§10.1.2); one is lost.
  const kept = [...owned.inHand, ...owned.played, ...owned.discarded];
  const capacity =
    kept.reduce((total, card) => total + card.unitSupport.count, 0) -
    Math.max(0, ...kept.map((card) => card.unitSupport.count));
  // The units the check would leave without a place, cheapest guessed first:
  // the bot cannot see which places match which units until it rallies.
  const shortfall = Math.max(0, survey.ownUnits.length - capacity);
  const exposed = survey.ownUnits
    .map((own) =>
      lossFromResult(own.unit, {
        unitRetreated: false,
        unitReversed: false,
        unitRouted: true,
      }),
    )
    .toSorted((a, b) => a - b)
    .slice(0, shortfall)
    .reduce((total, loss) => total + loss, 0);
  const gain = regained * CARD_WORTH;
  // A low hand is the danger: rally when it is low enough, and the check
  // costs less than the cards coming back.
  const lowWater = FEWEST_CARDS_TO_HOLD + Math.round(3 * temperament.thrift);
  const wantsToRally =
    regained > 0 && owned.inHand.length <= lowWater && exposed < gain;
  const choice =
    offers.find((offer) => offer.performRally === wantsToRally) ?? offers[0];
  if (choice === undefined) {
    throw new Error('A bot was asked whether to rally and offered nothing');
  }
  return choice;
}

/**
 * Gives each unit a place under the support its hand holds, after a rally
 * (§10.4.4). Every open place an unplaced unit could fill must be filled
 * (§10.4.5), so the bot fills them all; what it decides is who gets a place
 * when there are too few. It places its most valuable units first, so the
 * units that rout are the ones it can best afford to lose.
 *
 * @param offer - The support its hand holds and the units each place may take
 * @param context - What the bot decides from
 * @returns The places it gives
 */
export function chooseUnitSupport(
  offer: LegalAssignUnitSupport,
  context: BotContext,
): AssignUnitSupportEvent {
  const worth = (assignment: UnitSupportAssignment): number =>
    lossFromResult(assignment.unit, {
      unitRetreated: false,
      unitReversed: false,
      unitRouted: true,
    });
  const assignments: UnitSupportAssignment[] = [];
  // Offered a place at a time; fill until nothing more may be placed.
  for (;;) {
    const next = getLegalUnitSupportAssignments(offer, assignments);
    const best = next.next.toSorted((a, b) => worth(b) - worth(a))[0];
    if (best === undefined) {
      break;
    }
    assignments.push(best);
  }
  const event: AssignUnitSupportEvent = {
    assignments,
    choiceType: 'assignUnitSupport',
    eventType: 'playerChoice',
    player: context.seat,
  };
  return event;
}
