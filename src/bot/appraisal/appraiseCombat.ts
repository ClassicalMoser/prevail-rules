import type { AttackResult, UnitInstance } from '@entities';
import type { GameState } from '@game';
import { recallAttackResult, recallStat } from './recallStat';

/**
 * What a card is worth to a bot, in the same points as a unit's cost. A
 * routed unit costs its owner Morale paid in cards (§9.3), and a hand that
 * runs out loses the game, so losing a card is weighed like losing part of a
 * unit. A rough figure: a typical card is priced near a typical unit.
 */
export const CARD_WORTH = 8;

/**
 * What an attack costs the unit it lands on, in points. A rout takes the unit
 * off the board and charges its Morale in cards; a reverse leaves its back
 * to the enemy; a retreat gives ground but keeps it whole.
 *
 * @param unit - The unit struck
 * @param result - Which of its thresholds the attack met
 * @returns The points it loses
 */
export function lossFromResult(
  unit: UnitInstance,
  result: AttackResult,
): number {
  const { cost, morale } = unit.unitType;
  // A rout loses the unit and the cards that pay for it (§9.3).
  if (result.unitRouted) {
    const routLoss = cost + morale * CARD_WORTH;
    return routLoss;
  }
  // A unit turned about shows its back, the worst way to be caught next.
  let loss = 0;
  if (result.unitReversed) {
    loss += 0.4 * cost;
  }
  // A unit pushed back is out of the line but still whole.
  if (result.unitRetreated) {
    loss += 0.2 * cost;
  }
  return loss;
}

/**
 * What one attack does: the striker's Attack, with any support, measured
 * against the target's thresholds (§7.5.1).
 *
 * @param view - The game as the bot sees it, for the stats in force
 * @param striker - The unit striking
 * @param support - What its friends add (§7.3)
 * @param target - The unit struck
 * @returns The points the target loses
 */
export function appraiseAttack(
  view: GameState,
  striker: UnitInstance,
  support: number,
  target: UnitInstance,
): number {
  const attack = recallStat(view, striker, 'attack') + support;
  const result = recallAttackResult(view, attack, target);
  const loss = lossFromResult(target, result);
  return loss;
}

/**
 * What a melee between two units is worth to the first of them: the points
 * its attack takes from the enemy less those the enemy's attack takes from it.
 * Melee is mutual (§7.2.1), so both attacks count.
 *
 * @param view - The game as the bot sees it
 * @param own - The bot's unit and its support
 * @param enemy - The enemy unit and its support
 * @returns Positive when the trade favours the bot
 */
export function appraiseMelee(
  view: GameState,
  own: { unit: UnitInstance; support: number },
  enemy: { unit: UnitInstance; support: number },
): number {
  const dealt = appraiseAttack(view, own.unit, own.support, enemy.unit);
  const taken = appraiseAttack(view, enemy.unit, enemy.support, own.unit);
  return dealt - taken;
}
