import type { Army } from '@entities';

/**
 * The total Morale an army fields: each unit's worth to the army, counted
 * once for every copy (§3.1.3). A mode's Morale floor is measured against
 * this, so an army cannot be built of troops that cost nothing to lose
 * (§3.1.6).
 *
 * @param army - The army list
 * @returns The sum of every fielded unit's Morale
 */
export function getArmyMorale(army: Army): number {
  // Each copy of a unit type carries its Morale; cards carry none.
  const armyMorale = army.units.reduce(
    (total, unitCount) => total + unitCount.count * unitCount.unitType.morale,
    0,
  );

  // The floor in §3.1.3 is checked against this sum.
  return armyMorale;
}
