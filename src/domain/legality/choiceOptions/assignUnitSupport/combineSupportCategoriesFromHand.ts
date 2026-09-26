import type { CommandCard, UnitSupport } from '@entities';

/** Groups identical support kinds while summing counts (ignores `count`). */
function unitSupportKindLabel(unitSupport: UnitSupport): string {
  switch (unitSupport.supportType) {
    case 'generic': {
      return 'generic';
    }
    case 'trait': {
      return `trait:${unitSupport.trait}`;
    }
    case 'unitType': {
      return `unitType:${unitSupport.unitTypeId}`;
    }
    default: {
      const _exhaustive: never = unitSupport;
      return _exhaustive;
    }
  }
}

/**
 * Sums hand cards into support grants (unit type, trait, or generic).
 * Skips `count &lt; 1`. Does not attach eligible units.
 *
 * Order follows first appearance in `hand`.
 */
export function combineSupportCategoriesFromHand(
  hand: readonly Pick<CommandCard, 'unitSupport'>[],
): UnitSupport[] {
  const byKind = new Map<string, UnitSupport>();

  for (const card of hand) {
    const { unitSupport } = card;
    if (unitSupport.count < 1) {
      continue;
    }
    const kind = unitSupportKindLabel(unitSupport);
    const existing = byKind.get(kind);
    if (existing === undefined) {
      byKind.set(kind, { ...unitSupport });
      continue;
    }
    byKind.set(kind, {
      ...existing,
      count: existing.count + unitSupport.count,
    });
  }

  return [...byKind.values()];
}
