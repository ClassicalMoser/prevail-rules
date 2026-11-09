import type { UnitWithPlacement } from '@entities';
import type { GameState, RetreatOption } from '@game';
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
 * @returns Where the unit may retreat to, each with its path; empty when it cannot retreat
 * @throws Error when the unit does not stand at the given placement
 */
export function getLegalRetreats(
  unitWithPlacement: UnitWithPlacement,
  gameState: GameState,
): RetreatOption[] {
  // The caller names where the unit stands. If the board disagrees, the
  // state is faulty — that is not the rules saying "no retreat".
  const standing = isAtPlacement(gameState.boardState, unitWithPlacement);
  if (!standing.result) {
    throw new Error(standing.errorReason);
  }

  // An enemy behind, facing the unit, cuts its line of withdrawal: no
  // retreat at all, however much room lies beyond (§9.1.5).
  if (isRetreatCutOff(gameState.boardState, unitWithPlacement)) {
    const none: RetreatOption[] = [];
    return none;
  }

  // Every legal backward move, then only the smallest of them.
  const endings = exploreUnitMoves(gameState, unitWithPlacement, 'retreat');
  const smallest = getSmallestRetreats(endings);
  return smallest;
}
