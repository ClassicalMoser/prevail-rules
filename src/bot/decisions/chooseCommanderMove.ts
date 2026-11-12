import type { Coordinate } from '@entities';
import type { MoveCommanderEvent } from '@events';
import type { BotContext } from './botContext';
import { getCardInPlay, getSpacesApart } from '@queries';
import { pickBest } from '@bot/appraisal';

/** Points for each unit that would stand within the order's reach. */
const POINTS_PER_UNIT_IN_REACH = 2;

/** Points lost for standing next to an enemy unit. */
const POINTS_FOR_ENEMY_ALONGSIDE = 3;

/** Points lost for sharing a space with a unit that may soon fight. */
const POINTS_FOR_STANDING_IN_A_FIGHT = 4;

/**
 * Moves the general before orders are given (§4.2). Most orders reach only
 * units within a distance of the general (§4.3.4), so it goes where the card
 * now in play can reach the most of its army. An aggressive general leans
 * toward the enemy; a cautious one keeps clear of enemy units, and off the
 * space of a unit near the enemy, since a general falls with its own unit if
 * that unit routs in combat (§4.2.8).
 *
 * @param from - Where the general stands
 * @param destinations - Where it may go, staying put included when allowed
 * @param context - What the bot decides from
 * @returns The move it makes
 */
export function chooseCommanderMove(
  from: Coordinate,
  destinations: readonly Coordinate[],
  context: BotContext,
): MoveCommanderEvent {
  const { view, seat, survey, temperament, random } = context;
  const board = view.boardState;
  // The reach of the order it will give this round; a card with no reach
  // limit still rewards keeping the army together.
  const reach = Math.max(
    1,
    getCardInPlay(view.cardState, seat).command.restrictions
      .inspirationRangeRestriction,
  );
  const score = (destination: Coordinate): number => {
    let value = 0;
    for (const own of survey.ownUnits) {
      if (
        getSpacesApart(board, destination, own.placement.coordinate) <= reach
      ) {
        value += POINTS_PER_UNIT_IN_REACH;
      }
    }
    let nearestEnemy = Number.POSITIVE_INFINITY;
    for (const enemy of survey.enemyUnits) {
      const distance = getSpacesApart(
        board,
        destination,
        enemy.placement.coordinate,
      );
      nearestEnemy = Math.min(nearestEnemy, distance);
    }
    if (Number.isFinite(nearestEnemy)) {
      // Leaning toward the fight keeps the front line within reach.
      value -= temperament.aggression * nearestEnemy * 0.3;
      if (nearestEnemy <= 1) {
        value -= temperament.caution * POINTS_FOR_ENEMY_ALONGSIDE;
      }
      // Standing with one of its own units, the general shares its fate.
      const withOwnUnit = survey.ownUnits.some(
        (own) => own.placement.coordinate === destination,
      );
      if (withOwnUnit && nearestEnemy <= 2) {
        value -= temperament.caution * POINTS_FOR_STANDING_IN_A_FIGHT;
      }
    }
    return value;
  };
  const to = pickBest(destinations, score, temperament, random);
  const event: MoveCommanderEvent = {
    choiceType: 'moveCommander',
    eventType: 'playerChoice',
    from,
    player: seat,
    to,
  };
  return event;
}
