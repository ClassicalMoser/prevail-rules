import type { CommandCard, UnitInstance } from '@entities';
import type { AssignUnitSupportEvent, ChooseRallyEvent } from '@events';
import type { LegalAssignUnitSupport } from '@legality';
import type { BotContext } from './botContext';
import { combineSupportCategoriesFromHand } from '@legality';
import { getOwnedPlayerCardState, hasUnitInArray } from '@queries';
import {
  CARD_WORTH,
  lossFromResult,
  placeUnderSupport,
  stacksFor,
} from '@bot/appraisal';

/** A rally one card early is worth it if at least this many cards come back. */
const GENEROUS_RETURN = 3;

/**
 * What losing a unit at the support check costs: the unit, and its Morale
 * paid in cards (§10.4.6, §10.4.7).
 */
function routLoss(unit: UnitInstance): number {
  return lossFromResult(unit, {
    unitRetreated: false,
    unitReversed: false,
    unitRouted: true,
  });
}

/** The bot's units, most valuable first: the order it would keep them in. */
function byWorth(units: readonly UnitInstance[]): UnitInstance[] {
  return units.toSorted((a, b) => routLoss(b) - routLoss(a));
}

/**
 * What the support check after a rally would cost, on average. A rally takes
 * back the played and discarded cards and burns one of them at random
 * (§10.3.2); the hand that results must hold every unit on the board, and
 * whatever it cannot hold routs (§10.4). Which card burns is not the bot's
 * to choose, so each is weighed as equally likely.
 */
function expectedSupportCheck(
  hand: readonly CommandCard[],
  returning: readonly CommandCard[],
  units: readonly UnitInstance[],
): { loss: number; morale: number } {
  let loss = 0;
  let morale = 0;
  returning.forEach((_, burnt) => {
    const kept = [...hand, ...returning.filter((__, index) => index !== burnt)];
    const stacks = stacksFor(combineSupportCategoriesFromHand(kept), units);
    const placed = placeUnderSupport(stacks, units);
    for (const unit of units) {
      if (!placed.some((assignment) => assignment.unit === unit)) {
        loss += routLoss(unit);
        morale += unit.unitType.morale;
      }
    }
  });
  const draws = Math.max(1, returning.length);
  return { loss: loss / draws, morale: morale / draws };
}

/**
 * Decides whether to rally at Cleanup (§10.3). Rallying is the only way to
 * win cards back, and a hand that runs out loses (§11.1). But every rally
 * burns one card for good (§10.3.2), while a card on the played pile is not
 * lost, only waiting. So the bot waits, and rallies once its hand is down to
 * what the next round could cost it: a card to play, and the Morale of its
 * costliest unit, should that unit rout (§9.3, §11.2). If plenty would come
 * back it rallies a card earlier, since the burn then buys more. A thrifty
 * bot leans toward waiting.
 *
 * Rallying is weighed against declining, not against nothing. A rally may
 * cost units at the support check (§10.4), but the cards it wins back are
 * rounds of play, and they count for more the nearer the hand is to empty.
 * So it declines only a check that would cost more than those cards are
 * worth to a hand this low, or one whose Morale could empty its hand
 * (§11.2). With a single card left there is nothing to weigh: that card is
 * played next round and the empty hand loses the battle (§11.1), so any
 * rally that wins a card back is taken, whatever the check costs.
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
  const returning = [...owned.played, ...owned.discarded];
  const regained = Math.max(0, returning.length - 1);
  const units = byWorth(survey.ownUnits.map((own) => own.unit));
  // What the next round could take from the hand: a card to play, and the
  // Morale of the costliest unit if it routs.
  const costliestMorale = Math.max(
    0,
    ...units.map((unit) => unit.unitType.morale),
  );
  const lowWater = 1 + costliestMorale;
  // A spendthrift bot treats a hand one card fuller as already low.
  const reach = temperament.thrift < 0.5 ? 1 : 0;
  const hand = owned.inHand.length;
  const running = hand <= lowWater + reach;
  const generous = hand <= lowWater + reach + 1 && regained >= GENEROUS_RETURN;
  // Declining with one card left loses the battle next round (§11.1).
  const lastCard = hand <= 1;
  let wantsToRally = regained > 0 && (running || generous || lastCard);
  if (wantsToRally && !lastCard) {
    const check = expectedSupportCheck(owned.inHand, returning, units);
    const handAfter = hand + returning.length - 1;
    // The Morale of the routs must leave a card to play (§11.2).
    const affordable = check.morale < handAfter;
    // A card is worth more the fewer are left: at the low-water mark each
    // is worth its usual amount, and below it more.
    const cardWorth = (CARD_WORTH * Math.max(lowWater, hand)) / hand;
    const worthIt = check.loss < regained * cardWorth;
    wantsToRally = affordable && worthIt;
  }
  const choice =
    offers.find((offer) => offer.performRally === wantsToRally) ?? offers[0];
  if (choice === undefined) {
    throw new Error('A bot was asked whether to rally and offered nothing');
  }
  return choice;
}

/**
 * Gives each unit a place under the support its hand holds, after a rally
 * (§10.4.4): as many units as the hand can hold, and the most valuable of
 * them, so the units that rout are the ones it can best afford to lose.
 *
 * @param offer - The support its hand holds and the units each place may take
 * @param context - What the bot decides from
 * @returns The places it gives
 */
export function chooseUnitSupport(
  offer: LegalAssignUnitSupport,
  context: BotContext,
): AssignUnitSupportEvent {
  // Every unit any stack could take, each once, most valuable first.
  const units: UnitInstance[] = [];
  for (const stack of offer.categories) {
    for (const unit of stack.eligibleUnits) {
      if (!hasUnitInArray(units, unit)) {
        units.push(unit);
      }
    }
  }
  const event: AssignUnitSupportEvent = {
    assignments: placeUnderSupport(offer.categories, byWorth(units)),
    choiceType: 'assignUnitSupport',
    eventType: 'playerChoice',
    player: context.seat,
  };
  return event;
}
