import type { Modifier, MoveDelta, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { isAtPlacement } from '@queries';
import { exploreUnitMoves } from '../explore';
import { getSmallestRetreats } from './getSmallestRetreats';
import { isRetreatCutOff } from './isRetreatCutOff';

/**
 * Where a unit forced back by combat may fall to (§9.1). A retreat is a
 * backward move with the unit's own Speed and Flexibility, kept behind its
 * starting rank, opening with at most a 45° turn — and of every move that
 * satisfies that, only the smallest are offered (§9.1.3).
 *
 * An empty answer is a rule, not a fault: the unit cannot retreat, and so
 * routs (§9.1.6).
 *
 * @param unitWithPlacement - The retreating unit and where it stands
 * @param gameState - The current game state
 * @param commitmentModifiers - What a card committed for this retreat adds (§8), if one was. A defender falling back from a front engagement may commit a card for Speed or Flexibility first (§6.3.2), and it counts toward the retreat it is weighing.
 * @returns The paths the unit may retreat by, one per ending; empty when it cannot retreat
 * @throws Error when the unit does not stand at the given placement
 */
export function getLegalRetreats(
  unitWithPlacement: UnitWithPlacement,
  gameState: GameState,
  commitmentModifiers?: Modifier[],
): MoveDelta[][] {
  // The caller names where the unit stands. If the board disagrees, the
  // state is faulty — that is not the rules saying "no retreat".
  const standing = isAtPlacement(gameState.boardState, unitWithPlacement);
  if (!standing.result) {
    throw new Error(standing.errorReason);
  }

  // An enemy behind, facing the unit, cuts its line of withdrawal: no
  // retreat at all, however much room lies beyond (§9.1.5).
  if (isRetreatCutOff(gameState.boardState, unitWithPlacement)) {
    const none: MoveDelta[][] = [];
    return none;
  }

  // Every legal backward move, then only the smallest of them.
  // The walk keeps the retreat behind its starting rank and to its opening
  // 45° (§9.1.2, §9.1.4); the cut is asked first because no walk can see it.
  const endings = exploreUnitMoves(
    gameState,
    unitWithPlacement,
    'retreat',
    commitmentModifiers,
  );
  const smallest = getSmallestRetreats(endings);

  // One path per ending the owner may choose; empty when the walk found
  // nowhere to go, and the unit routs instead (§9.1.6).
  return smallest;
}
