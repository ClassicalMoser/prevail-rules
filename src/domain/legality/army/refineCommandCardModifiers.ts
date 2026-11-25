import type { CommandCard } from '@entities';
import type { StatModifier } from '@ruleValues';
import type { z } from 'zod';

/**
 * The first entry in a list of stats that an earlier entry already named, or
 * `undefined` when each stat is named once.
 */
function findRepeatedStat(stats: readonly StatModifier[]): number | undefined {
  // An entry whose stat appears earlier in the list repeats it.
  const repeated = stats.findIndex(
    (stat, index) => stats.indexOf(stat) !== index,
  );

  // No entry repeats, so the list names each stat once.
  const found = repeated === -1 ? undefined : repeated;
  return found;
}

/**
 * Adds a Zod issue for each list on a card that names one stat twice: the
 * stats it may be committed for, its command's modifiers, and its round
 * effect's. Each list raises a stat once, so naming it twice prints a bonus
 * the card cannot give.
 *
 * @param card - The card to check
 * @param ctx - The refinement context the issues are added to
 * @param pathPrefix - Where the card sits in a larger value, such as
 * `['commandCards', 2]` in an army
 */
export function refineCommandCardModifiers(
  card: CommandCard,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[],
): void {
  // The three lists a card prints, each with where it sits on the card.
  const lists = [
    { path: ['modifiers'], stats: card.modifiers },
    {
      path: ['command', 'modifiers'],
      stats: card.command.modifiers.map((modifier) => modifier.type),
    },
    {
      path: ['roundEffect', 'modifiers'],
      stats: card.roundEffect.modifiers.map((modifier) => modifier.type),
    },
  ];

  // Each list names a stat at most once.
  for (const list of lists) {
    const repeated = findRepeatedStat(list.stats);
    if (repeated !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'A card cannot name a stat twice in one list.',
        path: [...pathPrefix, ...list.path, repeated],
      });
    }
  }
}
