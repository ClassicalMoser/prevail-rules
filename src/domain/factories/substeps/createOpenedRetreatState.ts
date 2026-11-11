import type { MoveDelta, UnitWithPlacement } from '@entities';
import type { RetreatState } from '@game';

/**
 * A retreat the moment it opens: the unit falls back by the smallest legal
 * backward move (§9.1.3), and the paths it may take were worked out when the
 * retreat was called for.
 *
 * One legal retreat is not a choice, so it is carried out as it stands; with
 * several, the unit's owner chooses. A unit with somewhere to go never routs
 * from the retreat, so that slot is bypassed; with nowhere to go it routs
 * instead (§9.1.6), and the rout stays pending until it is opened.
 *
 * @param retreatingUnit - The unit falling back, and where it stands
 * @param legalRetreatPaths - Every retreat it may make, each as its path
 * @returns The retreat substep, open and unfinished
 */
export function createOpenedRetreatState(
  retreatingUnit: UnitWithPlacement,
  legalRetreatPaths: MoveDelta[][],
): RetreatState {
  const onlyPath =
    legalRetreatPaths.length === 1 ? legalRetreatPaths[0] : undefined;
  const retreatState: RetreatState = {
    chosenRetreatPath: onlyPath ?? 'pending',
    completed: false,
    legalRetreatPaths,
    retreatingUnit,
    routState: legalRetreatPaths.length === 0 ? 'pending' : 'bypassed',
    substepType: 'retreat',
  };
  return retreatState;
}
