import type { PlayerSide, UnitInstance, UnitSupport } from '@entities';
import type { GameState } from '@game';
import {
  findOwnedPlayerCardState,
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
 * time from {@link getSupportPlacementOffer}, which holds the rules of
 * capacity, one place per unit and **local maximality** (no unused slot may
 * still cover an uncovered unit; uncoverable units then rout on apply).
 * Global allocation optimality is not required.
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
  // Support is assigned in cleanup, after a rally has been resolved.
  const phaseState = gameState.currentRoundState.currentPhaseState;
  if (phaseState === 'none' || phaseState.phase !== 'cleanup') {
    return null;
  }

  if (
    phaseState.step !== 'firstPlayerResolveRally' &&
    phaseState.step !== 'secondPlayerResolveRally'
  ) {
    return null;
  }

  // Not yet burnt, or already assigned: nothing is due.
  if (!isAwaitingUnitSupport(getCurrentRallyResolutionState(gameState))) {
    return null;
  }

  const player = getRallyingPlayer(gameState);

  // Only the rallying player's seat can see the support cards in its hand.
  const owned = findOwnedPlayerCardState(gameState.cardState, player);
  if (owned === undefined) {
    return null;
  }
  const hand = owned.inHand;

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
