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
  // For each initiative a card may show, how many of the army's cards show
  // it; a value no card shows is a count of nothing, which the spread rule
  // reads as such.
  const counts: Record<number, number> = Object.fromEntries(
    LEGAL_INITIATIVES.map((initiative) => [
      initiative,
      army.commandCards.filter((card) => card.initiative === initiative).length,
    ]),
  );

  // One count per initiative value, ready to compare with the mode's spread.
  return counts;
}
