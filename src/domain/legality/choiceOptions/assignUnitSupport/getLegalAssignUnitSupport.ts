import type { PlayerSide, UnitInstance, UnitSupport } from '@entities';
import type { GameState } from '@game';
import {
  getCleanupPhaseState,
  getOtherPlayer,
  getOwnedPlayerCardState,
  getPlayerUnitsOnBoard,
  getRallyResolutionStateAwaitingUnitSupport,
  unitMatchesSupport,
} from '@queries';

import { combineSupportCategoriesFromHand } from './combineSupportCategoriesFromHand';

/**
 * One support category from the hand: slot budget and eligible board units.
 */
export interface LegalSupportCategory {
  unitSupport: UnitSupport;
  eligibleUnits: readonly UnitInstance[];
}

/**
 * Atomic assign-unit-support options for UI and validation after rally.
 *
 * Categories are summed from the hand by support kind (type / trait / generic).
 * Does not expand assignment combinations — callers assign up to `count`
 * eligible units per category; {@link isValidAssignUnitSupportEvent} checks
 * integrity and **local maximality** (no unused slot may still cover an
 * uncovered unit; uncoverable units then rout on apply). Global allocation
 * optimality is not required.
 *
 * `null` when assign-unit-support is not expected (wrong step / visibility).
 */
export interface LegalAssignUnitSupport {
  player: PlayerSide;
  categories: readonly LegalSupportCategory[];
}

/**
 * Returns support categories from the rallying player’s hand with eligible
 * board units when cleanup is awaiting unit-support assignment.
 */
export function getLegalAssignUnitSupport<S extends GameState>(
  gameState: S,
): LegalAssignUnitSupport | null {
  let phaseState;
  try {
    phaseState = getCleanupPhaseState(gameState);
  } catch {
    return null;
  }

  if (
    phaseState.step !== 'firstPlayerResolveRally' &&
    phaseState.step !== 'secondPlayerResolveRally'
  ) {
    return null;
  }

  const firstPlayer = gameState.currentInitiative;
  const player =
    phaseState.step === 'firstPlayerResolveRally'
      ? firstPlayer
      : getOtherPlayer(firstPlayer);

  try {
    getRallyResolutionStateAwaitingUnitSupport(gameState, player);
  } catch {
    return null;
  }

  let hand;
  try {
    hand = getOwnedPlayerCardState(gameState.cardState, player).inHand;
  } catch {
    return null;
  }

  const boardUnits = [...getPlayerUnitsOnBoard(gameState, player)];
  const categories: LegalSupportCategory[] = combineSupportCategoriesFromHand(
    hand,
  ).map((unitSupport) => ({
    eligibleUnits: boardUnits.filter((unit) =>
      unitMatchesSupport(unit, unitSupport),
    ),
    unitSupport,
  }));

  return { categories, player };
}
