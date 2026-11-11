import type { PlayerSide, UnitInstance, UnitSupport } from '@entities';
import type { GameState } from '@game';
import {
  findOwnedPlayerCardState,
  getCleanupPhaseState,
  getCurrentRallyResolutionState,
  getPlayerUnitsOnBoard,
  getRallyingPlayer,
  isAwaitingUnitSupport,
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
 * Does not expand assignment combinations — callers fill places one unit at a
 * time from {@link getLegalUnitSupportAssignments}, which holds the rules of
 * capacity, one place per unit and **local maximality** (no unused slot may
 * still cover an uncovered unit; uncoverable units then rout on apply).
 * Global allocation optimality is not required.
 *
 */
export interface LegalAssignUnitSupport {
  player: PlayerSide;
  /**
   * The unit support the hand sums to. Empty when this view cannot see the
   * hand: an opponent's seat knows a rally is being resolved, not what its
   * cards hold.
   */
  categories: readonly LegalSupportCategory[];
}

/**
 * Returns support categories from the rallying player’s hand with eligible
 * board units when cleanup is awaiting unit-support assignment.
 *
 * Support is asked for only while a rally awaits its assignment, so being
 * asked at any other time is the caller's mistake and throws. A hand this
 * view cannot see is an ordinary state for a seated client, and answers with
 * no categories.
 *
 * @throws Error outside cleanup, off a resolve rally step, or when the rally
 * is not awaiting unit support
 */
export function getLegalAssignUnitSupport<S extends GameState>(
  gameState: S,
): LegalAssignUnitSupport {
  // Support is assigned in cleanup, after a rally has been resolved.
  const phaseState = getCleanupPhaseState(gameState);
  if (
    phaseState.step !== 'firstPlayerResolveRally' &&
    phaseState.step !== 'secondPlayerResolveRally'
  ) {
    throw new Error(`Not on a resolve rally step: ${phaseState.step}`);
  }

  // Not yet burnt, or already assigned: nothing is due.
  if (!isAwaitingUnitSupport(getCurrentRallyResolutionState(gameState))) {
    throw new Error('The rally is not awaiting unit support');
  }

  const player = getRallyingPlayer(gameState);

  // Only the rallying player's seat can see the support cards in its hand.
  const owned = findOwnedPlayerCardState(gameState.cardState, player);
  const hand = owned === undefined ? [] : owned.inHand;

  const boardUnits = [...getPlayerUnitsOnBoard(gameState, player)];
  const categories: LegalSupportCategory[] = combineSupportCategoriesFromHand(
    hand,
  ).map((unitSupport) => ({
    eligibleUnits: boardUnits.filter((unit) =>
      unitMatchesSupport(unit, unitSupport),
    ),
    unitSupport,
  }));

  const legal: LegalAssignUnitSupport = { categories, player };
  return legal;
}
