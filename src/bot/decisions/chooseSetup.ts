import type { Coordinate, UnitFacing, UnitInstance } from '@entities';
import type { SetupUnitsEvent } from '@events';
import type { LegalSetupUnits } from '@legality';
import type { BotContext } from './botContext';
import { getCoordinateLayout } from '@factories';

/** A unit at least this fast is cavalry, for setup: it belongs on a wing. */
const CAVALRY_SPEED = 4;

/**
 * Where a space falls in a deployment: rows nearer the middle of the board
 * first, since that is where the enemy comes from, and within a row, spaces
 * nearer the centre first.
 */
function deploymentRank(
  context: BotContext,
  coordinate: Coordinate,
): { row: number; column: number } {
  const layout = getCoordinateLayout(context.view.boardState);
  const [row = '', column = ''] = coordinate.split('-');
  const middleRow = (layout.rowLetters.length - 1) / 2;
  const middleColumn = (layout.columnNumbers.length - 1) / 2;
  const rank = {
    column: Math.abs(layout.getColumnIndex(column) - middleColumn),
    row: Math.abs(layout.getRowIndex(row) - middleRow),
  };
  return rank;
}

/**
 * The order a bot lines its units up in: its main fighting line first, so it
 * takes the front row's centre; then its fast units, which spill out to the
 * wings of the front row; then its shooters, which stand in the row behind.
 * Within each, its most valuable units come first.
 */
function deploymentOrder(unit: UnitInstance): number {
  const { range, speed } = unit.unitType.stats;
  if (range > 0) {
    return 2;
  }
  if (speed >= CAVALRY_SPEED) {
    return 1;
  }
  return 0;
}

/**
 * Deploys the whole army at once in the bot's own zone (§3.5.1), every unit
 * facing the enemy across the board. The fighting line takes the front row's
 * centre, fast units its wings, and shooters the row behind. The general
 * stands behind the centre, where its reach covers the most of the line and
 * no unit of its own is likely to rout beneath it at first contact.
 *
 * @param offer - Its units still in reserve and the empty spaces of its zone
 * @param context - What the bot decides from
 * @returns Its deployment
 */
export function chooseSetup(
  offer: LegalSetupUnits,
  context: BotContext,
): SetupUnitsEvent {
  const layout = getCoordinateLayout(context.view.boardState);
  // Front row first, and the centre of each row before its ends.
  const spaces = offer.coordinates.toSorted((a, b) => {
    const rankA = deploymentRank(context, a);
    const rankB = deploymentRank(context, b);
    return rankA.row - rankB.row || rankA.column - rankB.column;
  });
  const units = offer.units.toSorted(
    (a, b) =>
      deploymentOrder(a) - deploymentOrder(b) ||
      b.unitType.cost - a.unitType.cost,
  );
  // The zone lies on one half of the board; the enemy is toward the other.
  const firstSpace = spaces[0];
  if (firstSpace === undefined) {
    throw new Error(`${offer.player} has no space left to deploy in`);
  }
  const [zoneRow = ''] = firstSpace.split('-');
  const facesSouth =
    layout.getRowIndex(zoneRow) < (layout.rowLetters.length - 1) / 2;
  const facing: UnitFacing = facesSouth ? 'south' : 'north';
  const unitPlacements = units.map((unit, index) => {
    const coordinate = spaces[index];
    if (coordinate === undefined) {
      throw new Error(`${offer.player} has more units than spaces to deploy`);
    }
    return { placement: { coordinate, facing }, unit };
  });
  // The general stands behind the centre of the line, on a space no unit
  // took if there is one, so no unit of its own can rout beneath it.
  const frontRow = deploymentRank(context, firstSpace).row;
  const behind = (space: Coordinate): boolean =>
    deploymentRank(context, space).row > frontRow;
  const behindTheLine =
    spaces.slice(units.length).find(behind) ??
    spaces.find(behind) ??
    firstSpace;
  const event: SetupUnitsEvent = {
    choiceType: 'setupUnits',
    commanderCoordinate: behindTheLine,
    eventType: 'playerChoice',
    player: offer.player,
    unitPlacements,
  };
  return event;
}
