import type { UnitWithPlacement } from '@entities';
import type { ChooseMovingUnitEvent, MoveUnitEvent } from '@events';
import type { LegalMoveUnits, MoveResult } from '@legality';
import type { BotContext } from './botContext';
import { appraisePlacement, pickBest } from '@bot/appraisal';
import { appraiseMoveGain } from './appraiseOrder';

/**
 * Picks which ordered unit moves next. Each is finished before the next
 * begins (§4.3.9), so order matters: a unit blocked by a friend can go once
 * the friend has moved. The bot moves first the unit with the most to gain,
 * which is usually the one at the front.
 *
 * @param offer - The ordered units still able to move
 * @param context - What the bot decides from
 * @returns The unit it moves next
 */
export function chooseMovingUnit(
  offer: LegalMoveUnits,
  context: BotContext,
): ChooseMovingUnitEvent {
  const unit: UnitWithPlacement = pickBest(
    offer.units,
    (candidate) => appraiseMoveGain(candidate, context),
    context.temperament,
    context.random,
  );
  const event: ChooseMovingUnitEvent = {
    choiceType: 'chooseMovingUnit',
    eventType: 'playerChoice',
    player: offer.player,
    unit,
  };
  return event;
}

/**
 * Writes a unit's move: of every ending its move may reach, the one the bot
 * likes best, whether a better place to stand or an engagement worth
 * starting. The general, if it shares the unit's space, stays where it is;
 * it has its own phase to move in (§4.2).
 *
 * @param unit - The unit moving
 * @param moves - Every ending its move may reach, each with its path
 * @param context - What the bot decides from
 * @returns The move it makes
 */
export function chooseUnitMove(
  unit: UnitWithPlacement,
  moves: readonly MoveResult[],
  context: BotContext,
): MoveUnitEvent {
  const { view, survey, temperament, random, seat } = context;
  const move = pickBest(
    moves,
    (candidate) =>
      appraisePlacement(view, survey, unit, candidate.placement, temperament),
    temperament,
    random,
  );
  const event: MoveUnitEvent = {
    choiceType: 'moveUnit',
    eventType: 'playerChoice',
    moveCommander: false,
    path: [...move.path],
    player: seat,
  };
  return event;
}
