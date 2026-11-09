import type { MoveTurn, UnitFacing } from '@entities';

/** The eight facings in clockwise order, starting from north. */
const compass: readonly UnitFacing[] = [
  'north',
  'northEast',
  'east',
  'southEast',
  'south',
  'southWest',
  'west',
  'northWest',
];

/** How far round the compass each turn goes, in eighths, clockwise. */
const turnSteps: Record<MoveTurn, number> = {
  turnAbout: 4,
  turnLeft: -1,
  turnRight: 1,
};

/**
 * The facing a unit ends on after one turn (§5.2.1): 45° to its own left
 * (counterclockwise) or right (clockwise), or 180° about. This is the
 * geometry of a turn only; whether the unit may make it is a rule of the
 * move it is part of.
 *
 * @param facing - The way the unit faces before the turn
 * @param turn - Which of the three turns it makes
 * @returns The way it faces after
 */
export function getTurnedFacing(
  facing: UnitFacing,
  turn: MoveTurn,
): UnitFacing {
  const from = compass.indexOf(facing);
  // Wrap round the compass in either direction.
  const to = (from + turnSteps[turn] + compass.length) % compass.length;
  const turned = compass[to];
  return turned;
}
