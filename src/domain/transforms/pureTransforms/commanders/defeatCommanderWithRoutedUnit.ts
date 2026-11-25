import type { UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { getBoardSpace } from '@queries';
import { defeatCommander } from './defeatCommander';

/**
 * A commander standing where one of its own units routs in combat is
 * defeated with it (§4.2.8). It leaves the board for good, and from then on
 * every inspiration range on its side's cards reaches nothing. Defeat costs
 * nothing else: no cards, no Morale.
 *
 * Only the routing unit's own commander falls; an enemy commander in the
 * same space is with its own unit, and stays. The support check's rout
 * never comes here (§10.4).
 *
 * @param state - The game state as the unit routs, the unit still on the board
 * @param routing - The unit routing in combat, and where it stands
 * @returns The state with its own commander gone, if it stood there; otherwise unchanged
 */
export function defeatCommanderWithRoutedUnit<S extends GameState>(
  state: S,
  routing: UnitWithPlacement,
): S {
  // Is the routing unit's own commander in its space?
  const side = routing.unit.playerSide;
  const { coordinate } = routing.placement;
  const space = getBoardSpace(state.boardState, coordinate);

  // Only a commander standing with its own routing unit falls; one anywhere
  // else is untouched.
  // TODO(composition): "does this side's commander stand on this space" is
  // asked by hand here and in `applyResolveRetreatEvent`,
  // `getLegalCommanderMoves` and `isValidMoveUnitEvent`, each reading
  // `space.commanders`. Settle by one `@queries` reader they all call.
  if (!space.commanders.includes(side)) {
    // Nothing changes.
    return state;
  }

  // It falls with the unit: off the board, and recorded as lost.
  const defeated = defeatCommander(state, side);

  // The state with its commander gone with the unit.
  return defeated;
}
