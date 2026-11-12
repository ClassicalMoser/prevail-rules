import type { UnitInstance, UnitSupport } from '@entities';
import type { UnitSupportAssignment } from '@events';
import { hasUnitInArray, unitMatchesSupport } from '@queries';

/** One stack of support a hand holds, and the units that could fill it. */
export interface SupportStack {
  unitSupport: UnitSupport;
  eligibleUnits: readonly UnitInstance[];
}

/**
 * Gives as many units as possible a place under the support a hand holds
 * (§10.4.4), and among the ways to place that many, the most valuable units.
 *
 * Placing greedily can strand a unit: a generic stack that takes a unit a
 * specific stack could have held leaves no room for one that only the generic
 * stack could hold. So each unit, most valuable first, is placed by finding
 * a free place for it, moving units already placed into other places they
 * fit if that frees one. Every unit placed stays placed, so the most valuable
 * units are the ones kept. The result fills every place an unplaced unit
 * could take, as the rules require (§10.4.5).
 *
 * @param stacks - The stacks of support, each with the units that fit it
 * @param units - The units to place, most valuable first
 * @returns One place for each unit placed
 */
export function placeUnderSupport(
  stacks: readonly SupportStack[],
  units: readonly UnitInstance[],
): UnitSupportAssignment[] {
  // Every place, one per unit a stack can hold, and who holds it.
  const places = stacks.flatMap((stack) =>
    Array.from({ length: stack.unitSupport.count }, () => stack),
  );
  // Who holds each place, by the unit's position in the list; none yet.
  const holder: (number | undefined)[] = Array.from({ length: places.length });
  const fits = (unitIndex: number, placeIndex: number): boolean => {
    const unit = units[unitIndex];
    const stack = places[placeIndex];
    return (
      unit !== undefined &&
      stack !== undefined &&
      hasUnitInArray(stack.eligibleUnits, unit)
    );
  };
  // Finds a place for a unit, moving others along if that frees one.
  const seat = (unitIndex: number, tried: Set<number>): boolean => {
    for (let placeIndex = 0; placeIndex < places.length; placeIndex += 1) {
      if (tried.has(placeIndex) || !fits(unitIndex, placeIndex)) {
        continue;
      }
      tried.add(placeIndex);
      const current = holder[placeIndex];
      if (current === undefined || seat(current, tried)) {
        holder[placeIndex] = unitIndex;
        return true;
      }
    }
    return false;
  };
  for (let unitIndex = 0; unitIndex < units.length; unitIndex += 1) {
    seat(unitIndex, new Set());
  }
  const assignments: UnitSupportAssignment[] = [];
  holder.forEach((unitIndex, placeIndex) => {
    const unit = unitIndex === undefined ? undefined : units[unitIndex];
    const stack = places[placeIndex];
    if (unit !== undefined && stack !== undefined) {
      assignments.push({ unit, unitSupport: stack.unitSupport });
    }
  });
  return assignments;
}

/**
 * The stacks a set of cards would hold for a set of units: each kind of
 * support, stacked across the cards that name it (§10.4.3), with the units
 * that fit it.
 *
 * @param supports - The stacked support of the cards
 * @param units - The units to be placed
 * @returns The stacks with their eligible units
 */
export function stacksFor(
  supports: readonly UnitSupport[],
  units: readonly UnitInstance[],
): SupportStack[] {
  const stacks = supports.map((unitSupport) => ({
    eligibleUnits: units.filter((unit) =>
      unitMatchesSupport(unit, unitSupport),
    ),
    unitSupport,
  }));
  return stacks;
}
