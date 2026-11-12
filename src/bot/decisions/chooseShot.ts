import type { UnitWithPlacement } from '@entities';
import type { ChooseShooterEvent, PerformRangedAttackEvent } from '@events';
import type { LegalRangedAttackers } from '@legality';
import type { BotContext } from './botContext';
import { getLegalRangedAttackSupporters } from '@legality';
import { appraiseBlow, pickBest } from '@bot/appraisal';
import { appraiseBestShot } from './appraiseOrder';

/**
 * Picks which ordered unit shoots next: the one with the best shot open to
 * it.
 *
 * @param offer - The ordered units able to shoot
 * @param context - What the bot decides from
 * @returns The shooter it names
 */
export function chooseShooter(
  offer: LegalRangedAttackers,
  context: BotContext,
): ChooseShooterEvent {
  const unit = pickBest(
    offer.attackers,
    (attacker) => appraiseBestShot(attacker, context),
    context.temperament,
    context.random,
  );
  const event: ChooseShooterEvent = {
    choiceType: 'chooseShooter',
    eventType: 'playerChoice',
    player: offer.player,
    unit,
  };
  return event;
}

/**
 * The fewest supporters that make a shot as hard as it can be. Each ordered
 * unit that supports adds +1 and gives up its own shot (§7.3.4), so the bot
 * adds supporters only while each one makes the shot worse for the target.
 */
function supportersNeeded(
  shooter: UnitWithPlacement,
  target: UnitWithPlacement,
  context: BotContext,
): { supporters: UnitWithPlacement[]; worth: number } {
  const { view } = context;
  const available = getLegalRangedAttackSupporters(shooter, target, view);
  let best = {
    supporters: [] as UnitWithPlacement[],
    worth: appraiseBlow(view, shooter.unit, 0, target.unit),
  };
  for (let count = 1; count <= available.length; count += 1) {
    const worth = appraiseBlow(view, shooter.unit, count, target.unit);
    if (worth > best.worth) {
      best = { supporters: available.slice(0, count), worth };
    }
  }
  return best;
}

/**
 * Aims a shot (§7.4): of every enemy in the shooter's arc and range, the one
 * it can hurt most, with only as much support as that takes.
 *
 * @param shooter - The unit shooting
 * @param targets - The enemies it may target
 * @param context - What the bot decides from
 * @returns The shot it takes
 */
export function chooseShotTarget(
  shooter: UnitWithPlacement,
  targets: readonly UnitWithPlacement[],
  context: BotContext,
): PerformRangedAttackEvent {
  const target = pickBest(
    targets,
    (candidate) => supportersNeeded(shooter, candidate, context).worth,
    context.temperament,
    context.random,
  );
  const { supporters } = supportersNeeded(shooter, target, context);
  const event: PerformRangedAttackEvent = {
    choiceType: 'performRangedAttack',
    eventType: 'playerChoice',
    player: shooter.unit.playerSide,
    supportingUnits: supporters,
    targetUnit: target,
  };
  return event;
}
