import type { Army } from '@entities';
import { LEGAL_INITIATIVES } from '@ruleValues';

/**
 * How many of an army's command cards show each initiative value. A mode
 * that limits the spread asks for the same number at every value
 * (§3.1.7), so no army can be built to always go first.
 *
 * Every legal initiative has an entry, a value the army holds no card at
 * included, so a missing value reads as zero rather than as absent.
 *
 * @param army - The army list
 * @returns The number of cards at each legal initiative value
 */
export function countCommandCardsByInitiative(
  army: Army,
): Record<number, number> {
  // Start every legal value at zero: a value with no card is a count of
  // nothing, and the spread rule reads it as such.
  const counts: Record<number, number> = Object.fromEntries(
    LEGAL_INITIATIVES.map((initiative) => [initiative, 0]),
  );

  // Each card counts once toward the initiative it shows.
  for (const card of army.commandCards) {
    counts[card.initiative] = (counts[card.initiative] ?? 0) + 1;
  }

  // One count per initiative value, ready to compare with the mode's spread.
  return counts;
}
