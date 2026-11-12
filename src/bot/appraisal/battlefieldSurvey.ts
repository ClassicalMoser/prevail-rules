import type {
  Coordinate,
  PlayerSide,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import type { GameState } from '@game';
import {
  findCommanderSpace,
  getOtherPlayer,
  getPlayerUnitsWithPlacementOnBoard,
} from '@queries';

/**
 * What a bot takes in at a glance before it decides: where its own units and
 * the enemy's stand, and where each general is. Every option of one decision
 * is scored against the same survey, so the board is read once per decision
 * rather than once per option.
 */
export interface BattlefieldSurvey {
  /** The side the bot plays. */
  seat: PlayerSide;
  /** The other side. */
  enemy: PlayerSide;
  /** The bot's own units on the board, with where they stand. */
  ownUnits: readonly UnitWithPlacement[];
  /** The enemy's units on the board, with where they stand. */
  enemyUnits: readonly UnitWithPlacement[];
  /** Where the bot's general stands, if it is on the board. */
  ownCommander: Coordinate | undefined;
  /** Where the enemy general stands, if it is on the board. */
  enemyCommander: Coordinate | undefined;
  /**
   * The bot's units ordered to move this phase that have not moved yet
   * (§4.3.9). While an order is carried out, where they stand now is not
   * where they will stand, so a unit keeping its place in the line does not
   * hold itself to them.
   */
  stillToMove: readonly UnitInstance[];
}

/**
 * Surveys the board as one seat sees it. The board is public, so a seat's
 * view shows every unit; only the hands are hidden from it.
 *
 * @param view - The game as the bot's seat sees it
 * @param seat - The side the bot plays
 * @param stillToMove - Its units ordered to move that have not yet moved
 * @returns Where everything stands
 */
export function surveyBattlefield(
  view: GameState,
  seat: PlayerSide,
  stillToMove: readonly UnitInstance[] = [],
): BattlefieldSurvey {
  const enemy = getOtherPlayer(seat);
  const survey: BattlefieldSurvey = {
    enemy,
    enemyCommander: findCommanderSpace(enemy, view.boardState),
    enemyUnits: [...getPlayerUnitsWithPlacementOnBoard(view, enemy)],
    ownCommander: findCommanderSpace(seat, view.boardState),
    ownUnits: [...getPlayerUnitsWithPlacementOnBoard(view, seat)],
    seat,
    stillToMove,
  };
  return survey;
}
