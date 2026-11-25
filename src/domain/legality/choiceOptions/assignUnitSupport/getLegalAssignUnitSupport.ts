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
  /** One stack of places, summed from every card naming the same kind of unit (§10.4.3). */
  unitSupport: UnitSupport;
  /** The rallying player's units on the board that match the stack, in board order. */
  eligibleUnits: readonly UnitInstance[];
}

/**
 * Atomic assign-unit-support options for UI and validation after rally.
 *
 * Categories are summed from the hand by support kind (type / trait / generic).
 * Does not expand assignment combinations — callers fill places one unit at a
 * time from `getLegalUnitSupportAssignments`, which holds the rules of
 * capacity, one place per unit and **local maximality** (no unused slot may
 * still cover an uncovered unit; uncoverable units then rout on apply).
 * Global allocation optimality is not required.
 *
 */
export interface LegalAssignUnitSupport {
  /** The player who rallied, and so the only one whose units are checked (§10.4.1). */
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
  // Support is assigned in cleanup, on the step that carries out a rally
  // (§10.3.2 step 4); the choose-rally steps and the steps either side of
  // both rallies have no rally to assign for.
  // TODO(composition): `getCurrentRallyResolutionState` below makes the same
  // step check and throws `Not in a resolveRally step`, so this one only
  // words the fault first. Settle by dropping it, once that message is the
  // one wanted.
  const phaseState = getCleanupPhaseState(gameState);
  if (
    phaseState.step !== 'firstPlayerResolveRally' &&
    phaseState.step !== 'secondPlayerResolveRally'
  ) {
    throw new Error(`Not on a resolve rally step: ${phaseState.step}`);
  }

  // The check is made in the instant after the rally gathers every card
  // back into hand, and only once (§10.4.1). Not yet burnt, or already
  // assigned: nothing is due.
  if (!isAwaitingUnitSupport(getCurrentRallyResolutionState(gameState))) {
    throw new Error('The rally is not awaiting unit support');
  }

  // Only the player who rallied checks their units (§10.4.1); the other
  // side's army is not tested.
  const player = getRallyingPlayer(gameState);

  // Only the rallying player's seat can see the support cards in its hand.
  // Any other view knows a rally is being resolved, not what the cards hold,
  // so it is offered no stacks.
  const owned = findOwnedPlayerCardState(gameState.cardState, player);
  const hand = owned === undefined ? [] : owned.inHand;

  // Every unit the player has on the board needs a place, engaged or not
  // (§10.4.4).
  const boardUnits = [...getPlayerUnitsOnBoard(gameState, player)];

  // The hand's cards, added up into one stack per kind of unit they name
  // (§10.4.3).
  const stacks = combineSupportCategoriesFromHand(hand);

  // Each stack is offered with the units that may take one of its places:
  // a unit goes only in a stack it matches (§10.4.4). The player then fills
  // the places one unit at a time from `getLegalUnitSupportAssignments`.
  const categories: LegalSupportCategory[] = stacks.map((unitSupport) => {
    const eligibleUnits = boardUnits.filter((unit) =>
      unitMatchesSupport(unit, unitSupport),
    );
    const category: LegalSupportCategory = { eligibleUnits, unitSupport };
    return category;
  });

  // The rallying player, and the stacks their hand holds with the units
  // each may take.
  const legal: LegalAssignUnitSupport = { categories, player };
  return legal;
}
