import type { CommandCard, Modifier, UnitWithPlacement } from '@entities';
import type { BotContext } from './botContext';
import {
  getMeleeCombatants,
  getMeleeSupportValue,
  getMovementResolutionState,
  getOwnedPlayerCardState,
  getRangedAttackResolutionState,
  isSameUnitInstance,
  modifiersFromCompletedCommitment,
} from '@queries';
import {
  appraiseKeeping,
  CARD_WORTH,
  lossFromResult,
  pickBest,
  recallBlow,
  recallStat,
} from '@bot/appraisal';
import { appraiseBestShot, appraiseMoveGain } from './appraiseOrder';

/** Below this many cards in hand, every card spent is doubly dear. */
const SHORT_HAND = 3;

/** One commitment the bot may make: a card from hand, or none (§8.3). */
interface CommitmentOffer {
  committedCard: CommandCard | null;
}

/**
 * What committing a card would add to a unit: +1 to each stat the card names
 * (§8.2).
 */
function commitmentModifiers(card: CommandCard): Modifier[] {
  return card.modifiers.map((stat) => ({ type: stat, value: 1 }));
}

/**
 * What spending a card costs the bot. The card goes to the discard pile until
 * a rally brings it back (§8.1), so it is a loan from the hand rather than a
 * loss, but a hand that runs out loses (§11.1). A thrifty bot prices the loan
 * higher, and a short hand doubles the price.
 */
function commitmentCost(
  card: CommandCard,
  handSize: number,
  thrift: number,
): number {
  const loan =
    CARD_WORTH * (0.25 + 0.75 * thrift) + 0.3 * appraiseKeeping(card);
  return handSize <= SHORT_HAND ? loan * 2 : loan;
}

/**
 * Commits a card, or declines, once the bot knows what the +1 would buy. It
 * commits only where the gain outweighs the cost of the card, and never its
 * last card: an empty hand loses at once (§11.6).
 *
 * @param offers - Each card it may commit, and the refusal
 * @param gainFrom - What committing a card would gain, in points
 * @param context - What the bot decides from
 * @returns The offer it takes
 */
export function chooseCommitment<Offer extends CommitmentOffer>(
  offers: readonly Offer[],
  gainFrom: (card: CommandCard) => number,
  context: BotContext,
): Offer {
  const { view, seat, temperament, random } = context;
  const handSize = getOwnedPlayerCardState(view.cardState, seat).inHand.length;
  // Committing the last card would empty the hand and lose the game.
  const affordable =
    handSize > 1
      ? offers
      : offers.filter((offer) => offer.committedCard === null);
  const choice = pickBest(
    affordable,
    (offer) =>
      offer.committedCard === null
        ? 0
        : gainFrom(offer.committedCard) -
          commitmentCost(offer.committedCard, handSize, temperament.thrift),
    temperament,
    random,
  );
  return choice;
}

/**
 * What committing a card to a melee would gain (§7.2.2): the fight replayed
 * with the card's +1 to Attack or to Defence (§8.5) against the fight as it
 * stands, with support counted from the board (§7.3.3).
 *
 * @param context - What the bot decides from
 * @returns The gain from committing a card
 */
export function meleeCommitmentGain(
  context: BotContext,
): (card: CommandCard) => number {
  const { view, seat } = context;
  const combatants = getMeleeCombatants(view);
  const own = combatants[seat];
  const enemy = combatants[context.survey.enemy];
  const ownSupport = getMeleeSupportValue(view.boardState, own);
  const enemySupport = getMeleeSupportValue(view.boardState, enemy);
  const fight = (modifiers?: Modifier[]): number => {
    const ownAttack =
      recallStat(view, own.unit, 'attack', modifiers) + ownSupport;
    const enemyAttack = recallStat(view, enemy.unit, 'attack') + enemySupport;
    const dealt = lossFromResult(
      enemy.unit,
      recallBlow(view, ownAttack, enemy.unit),
    );
    const taken = lossFromResult(
      own.unit,
      recallBlow(view, enemyAttack, own.unit, modifiers),
    );
    return dealt - taken;
  };
  const without = fight();
  return (card) => fight(commitmentModifiers(card)) - without;
}

/**
 * What committing a card to a move would gain (§4.3.10): the best ending the
 * unit could reach with the card's Speed or Flexibility against its best
 * without.
 *
 * @param context - What the bot decides from
 * @returns The gain from committing a card
 */
export function movementCommitmentGain(
  context: BotContext,
): (card: CommandCard) => number {
  const { movingUnit } = getMovementResolutionState(context.view);
  const without = appraiseMoveGain(movingUnit, context);
  return (card) =>
    appraiseMoveGain(movingUnit, context, commitmentModifiers(card)) - without;
}

/**
 * What committing a card to a shot would gain (§7.4.5): the best shot with
 * the card's Range or Attack against the best without. The shooter commits
 * before naming a target, so the gain is over every target it might choose.
 *
 * @param context - What the bot decides from
 * @returns The gain from committing a card
 */
export function rangedAttackCommitmentGain(
  context: BotContext,
): (card: CommandCard) => number {
  const { attackingUnit } = getRangedAttackResolutionState(context.view);
  const shooter: UnitWithPlacement | undefined = context.survey.ownUnits.find(
    (own) => isSameUnitInstance(own.unit, attackingUnit),
  );
  if (shooter === undefined) {
    throw new Error('The shooter is not on the board');
  }
  const without = appraiseBestShot(shooter, context);
  return (card) =>
    appraiseBestShot(shooter, context, commitmentModifiers(card)) - without;
}

/**
 * What committing a card to defend against a shot would gain (§7.4.5,
 * §8.5): the blow as it will land against the blow with the target's
 * thresholds raised. The shooter's card and supporters are known by now.
 *
 * @param context - What the bot decides from
 * @returns The gain from committing a card
 */
export function rangedDefenseCommitmentGain(
  context: BotContext,
): (card: CommandCard) => number {
  const { view } = context;
  const shot = getRangedAttackResolutionState(view);
  const { defendingUnit } = shot;
  if (defendingUnit === 'pending') {
    throw new Error('The shot has no target yet');
  }
  const support =
    shot.supportingUnits === 'pending' ? 0 : shot.supportingUnits.length;
  const attack =
    recallStat(
      view,
      shot.attackingUnit,
      'attack',
      modifiersFromCompletedCommitment(shot.attackingCommitment),
    ) + support;
  const taken = (modifiers?: Modifier[]): number =>
    lossFromResult(
      defendingUnit,
      recallBlow(view, attack, defendingUnit, modifiers),
    );
  const without = taken();
  return (card) => without - taken(commitmentModifiers(card));
}
