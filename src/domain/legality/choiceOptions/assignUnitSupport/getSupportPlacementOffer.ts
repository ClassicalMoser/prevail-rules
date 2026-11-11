import type { UnitInstance, UnitSupport } from '@entities';
import type { PartOffer } from '@utils';
import type { LegalAssignUnitSupport } from './getLegalAssignUnitSupport';
import {
  areUnitSupportsEqual,
  isSameUnitInstance,
  unitMatchesSupport,
} from '@queries';

/** One unit taking one place in one pool (§10.4.4). */
export interface SupportPlacement {
  /** The pool, as the hand sums it (§10.4.3). */
  unitSupport: UnitSupport;
  /** The unit taking a place in it. */
  unit: UnitInstance;
}

/**
 * Whether two placements put the same unit in the same pool.
 *
 * @param a - One placement
 * @param b - The other
 * @returns True when the unit and the pool are the same
 */
export function isSameSupportPlacement(
  a: SupportPlacement,
  b: SupportPlacement,
): boolean {
  const same =
    areUnitSupportsEqual(a.unitSupport, b.unitSupport) &&
    isSameUnitInstance(a.unit, b.unit).result;
  return same;
}

/** How many places in this pool the placements so far have filled. */
function placesFilled(
  unitSupport: UnitSupport,
  placedSoFar: readonly SupportPlacement[],
): number {
  const filled = placedSoFar.filter((placement) =>
    areUnitSupportsEqual(placement.unitSupport, unitSupport),
  ).length;
  return filled;
}

/** Whether this unit already has its one place (§10.4.4). */
function hasPlace(
  unit: UnitInstance,
  placedSoFar: readonly SupportPlacement[],
): boolean {
  const placed = placedSoFar.some(
    (placement) => isSameUnitInstance(placement.unit, unit).result,
  );
  return placed;
}

/**
 * The places a player may still fill after a rally, given the units placed
 * so far, and whether they may stop placing (§10.4.4–10.4.5).
 *
 * A unit takes only one place, and only in a pool it matches; a pool takes
 * no more units than its count. Any open place that an uncovered unit could
 * fill must be filled (§10.4.5), so the player may stop exactly when nothing
 * more can be placed. They are not required to find the arrangement that
 * saves the most units: which unit goes in which pool is theirs to choose,
 * and a poor choice is allowed to cost them.
 *
 * @param legal - The pools in the rallying player's hand, each with the units
 * on the board that match it
 * @param placedSoFar - The places filled so far, in any order
 * @returns Each place that may be filled next, and whether placing may stop
 */
export function getSupportPlacementOffer(
  legal: LegalAssignUnitSupport,
  placedSoFar: readonly SupportPlacement[],
): PartOffer<SupportPlacement> {
  const next: SupportPlacement[] = [];
  for (const { eligibleUnits, unitSupport } of legal.categories) {
    // A full pool takes nobody more.
    if (placesFilled(unitSupport, placedSoFar) >= unitSupport.count) {
      continue;
    }
    // Any matching unit still without a place may take one here.
    for (const unit of eligibleUnits) {
      if (!hasPlace(unit, placedSoFar)) {
        next.push({ unit, unitSupport });
      }
    }
  }

  // Use what you have: placing ends only when no open place can take an
  // uncovered unit (§10.4.5).
  const offer: PartOffer<SupportPlacement> = {
    mayStop: next.length === 0,
    next,
  };
  return offer;
}

/**
 * Names a pool for a player reading a refusal: its kind and its size.
 *
 * @param unitSupport - The pool
 * @returns A short label such as `trait:formation:4`
 */
export function describeSupportPool(unitSupport: UnitSupport): string {
  switch (unitSupport.supportType) {
    case 'generic': {
      return `generic:${unitSupport.count}`;
    }
    case 'trait': {
      return `trait:${unitSupport.trait}:${unitSupport.count}`;
    }
    case 'unitType': {
      return `unitType:${unitSupport.unitTypeId}:${unitSupport.count}`;
    }
    default: {
      const _exhaustive: never = unitSupport;
      return _exhaustive;
    }
  }
}

/**
 * Why a placement was not among those offered after the placements so far:
 * the rule of §10.4.3–10.4.4 it breaks, in the order a player would check
 * them.
 *
 * @param legal - The pools in the rallying player's hand
 * @param placedSoFar - The places filled before this one
 * @param placement - The placement that was not offered
 * @returns The reason, for a refusal
 */
export function describeRefusedSupportPlacement(
  legal: LegalAssignUnitSupport,
  placedSoFar: readonly SupportPlacement[],
  placement: SupportPlacement,
): string {
  const label = describeSupportPool(placement.unitSupport);

  // The pool must be one the hand makes (§10.4.3).
  const pool = legal.categories.find((category) =>
    areUnitSupportsEqual(category.unitSupport, placement.unitSupport),
  );
  if (pool === undefined) {
    return `Unit support ${label} is not available from hand`;
  }

  // A unit takes only one place (§10.4.4).
  if (hasPlace(placement.unit, placedSoFar)) {
    return 'Unit is assigned support more than once';
  }

  // A pool takes no more units than its count.
  if (placesFilled(pool.unitSupport, placedSoFar) >= pool.unitSupport.count) {
    return `Assignment for ${label} exceeds support count ${pool.unitSupport.count}`;
  }

  // Otherwise the unit is not one of the player's units on the board that
  // matches this pool.
  if (!unitMatchesSupport(placement.unit, pool.unitSupport)) {
    return `Unit does not match support ${label}`;
  }
  return `Unit is not on the board for ${legal.player}`;
}
