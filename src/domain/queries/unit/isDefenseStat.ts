import type { UnitStatName } from '@entities';

/**
 * The defense stat names (reverse, retreat, rout).
 * These stats are grouped together as 'defense' in card modifiers.
 */
const defenseStatNames = ['reverse', 'retreat', 'rout'] as const;

/**
 * Whether a unit stat is a defense stat (reverse, retreat, or rout).
 *
 * @param stat - The stat name to check
 * @returns True if the stat is a defense stat
 */
export function isDefenseStat(stat: UnitStatName): boolean {
  // The stat is one of the seven; comparing it to each defense stat needs no
  // widening of the list.
  const isDefense = defenseStatNames.some((name) => name === stat);
  return isDefense;
}
