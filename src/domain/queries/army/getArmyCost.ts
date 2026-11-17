import type { Army } from '@entities';

/**
 * What an army costs to field: every unit it lists, each copy counted, and
 * every command card it brings (§3.1.3). A mode's cost cap is measured
 * against this total, so units and cards are bought from the same points.
 *
 * @param army - The army list
 * @returns The army's total cost
 */
export function getArmyCost(army: Army): number {
  // Each listed unit type costs its price once for every copy fielded.
  const unitCost = army.units.reduce(
    (total, unitCount) => total + unitCount.count * unitCount.unitType.cost,
    0,
  );

  // The cards are part of the army too, and are paid for from the same budget.
  const cardCost = army.commandCards.reduce(
    (total, card) => total + card.cost,
    0,
  );

  // The cap in §3.1.3 limits units and cards together.
  const armyCost = unitCost + cardCost;
  return armyCost;
}
