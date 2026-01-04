import type { UnitStatName } from '@entities';

/**
 * The defense stat names (reverse, retreat, rout).
 * These stats are grouped together as 'defense' in card modifiers.
 */
const defenseStatNames = ['reverse', 'retreat', 'rout'] as const;

/**
 * Checks if a unit stat is a defense stat (reverse, retreat, or rout).
 *
 * @param stat - The stat name to check
 * @returns True if the stat is a defense stat, false otherwise
 */
export function isDefenseStat(stat: UnitStatName): boolean {
  try {
    return (defenseStatNames as readonly string[]).includes(stat);
  } catch {
    return false;
  }
}
