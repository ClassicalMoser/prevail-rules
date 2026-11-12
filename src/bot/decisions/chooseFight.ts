import type {
  ChooseMeleeResolutionEvent,
  ChooseRetreatOptionEvent,
  ChooseWhetherToRetreatEvent,
} from '@events';
import type { BotContext } from './botContext';
import {
  getEngagementStateFromMovement,
  getMeleeSupportValue,
  isSameUnitInstance,
} from '@queries';
import { appraiseMelee, pickBest } from '@bot/appraisal';

/** What giving ground costs a unit, as a share of its cost. */
const RETREAT_SHARE = 0.2;

/**
 * What the fight in one engaged space is worth to the bot, support counted
 * from the board as it stands (§7.3.3).
 */
function appraiseFightAt(
  space: ChooseMeleeResolutionEvent['space'],
  context: BotContext,
): number {
  const { view, survey } = context;
  const own = survey.ownUnits.find(
    (unit) => unit.placement.coordinate === space,
  );
  const enemy = survey.enemyUnits.find(
    (unit) => unit.placement.coordinate === space,
  );
  if (own === undefined || enemy === undefined) {
    throw new Error(`No fight between the two sides at ${space}`);
  }
  const value = appraiseMelee(
    view,
    { support: getMeleeSupportValue(view.boardState, own), unit: own.unit },
    { support: getMeleeSupportValue(view.boardState, enemy), unit: enemy.unit },
  );
  return value;
}

/**
 * Picks which engagement to fight next, as first player (§4.4.2). Support is
 * counted afresh for every fight, and a unit routed in one fight lends no
 * support to the next (§7.3.3), so the bot fights first where it is surest to
 * win: clearing those enemies away can tip the fights after.
 *
 * @param offers - The engagements still to fight
 * @param context - What the bot decides from
 * @returns The engagement it fights next
 */
export function chooseNextFight(
  offers: readonly ChooseMeleeResolutionEvent[],
  context: BotContext,
): ChooseMeleeResolutionEvent {
  const choice = pickBest(
    offers,
    (offer) => appraiseFightAt(offer.space, context),
    context.temperament,
    context.random,
  );
  return choice;
}

/**
 * Decides whether a defender engaged from the front falls back instead of
 * fighting, when it is fast enough to be offered that (§6.3.2). Falling back
 * gives ground but keeps the unit whole; standing means the melee in Phase 4.
 * The bot stands when the fight looks better than the ground it would give,
 * and a bot with more stomach for risk stands in a closer fight.
 *
 * @param offers - Fall back or stand
 * @param context - What the bot decides from
 * @returns Its decision
 */
export function chooseWhetherToRetreat(
  offers: readonly ChooseWhetherToRetreatEvent[],
  context: BotContext,
): ChooseWhetherToRetreatEvent {
  const { view, survey, temperament } = context;
  const engagement = getEngagementStateFromMovement(view);
  const defender = survey.ownUnits.find(
    (own) => own.placement.coordinate === engagement.targetPlacement.coordinate,
  );
  const engager = survey.enemyUnits.find((enemy) =>
    isSameUnitInstance(enemy.unit, engagement.engagingUnit),
  );
  let fightWorth = 0;
  if (defender !== undefined) {
    // Where the engager stands now, or the space it is stepping into.
    const engagerSupport =
      engager === undefined
        ? 0
        : getMeleeSupportValue(view.boardState, engager);
    fightWorth = appraiseMelee(
      view,
      {
        support: getMeleeSupportValue(view.boardState, defender),
        unit: defender.unit,
      },
      { support: engagerSupport, unit: engagement.engagingUnit },
    );
  }
  const cost = defender === undefined ? 0 : defender.unit.unitType.cost;
  // Giving ground costs a little; a risk-taker counts it as costing more.
  const retreatWorth =
    -RETREAT_SHARE * cost * (0.5 + temperament.riskTolerance);
  const wantsToRetreat = fightWorth < retreatWorth;
  const choice =
    offers.find((offer) => offer.choosesToRetreat === wantsToRetreat) ??
    offers[0];
  if (choice === undefined) {
    throw new Error('A bot was asked whether to retreat and offered nothing');
  }
  return choice;
}

/**
 * Picks among retreats the rules leave open. A retreat must be the smallest
 * legal backward move, and only where several tie does the owner choose the
 * space and facing (§9.1.3). The bot does not yet judge where each one
 * leaves it, so it takes one as its whims fall.
 *
 * @param offers - The tied retreats
 * @param context - What the bot decides from
 * @returns The retreat it makes
 */
export function chooseRetreatOption(
  offers: readonly ChooseRetreatOptionEvent[],
  context: BotContext,
): ChooseRetreatOptionEvent {
  const choice = pickBest(offers, () => 0, context.temperament, context.random);
  return choice;
}
