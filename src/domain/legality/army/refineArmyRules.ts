import type { Army } from '@entities';
import { armySchema } from '@entities';
import type { z } from 'zod';

/**
 * Adds Zod issues for the army rules that hold in every game mode: no unit
 * type fielded past its limit, and nothing listed twice.
 *
 * Takes only the units and command cards, so a caller without an army id
 * (such as a draft being written) can run the same rules.
 *
 * @param pathPrefix - Where the army sits in a larger value, such as
 * `['whiteArmy']` in a game, so each issue points at the right army.
 */
export function refineArmyRules(
  army: Pick<Army, 'units' | 'commandCards'>,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  // Each unit type carries its own limit on how many may be fielded.
  for (const [index, unit] of army.units.entries()) {
    if (unit.count > unit.unitType.limit) {
      ctx.addIssue({
        code: 'custom',
        message: 'Count must be less than or equal to unit type limit.',
        path: [...pathPrefix, 'units', index, 'count'],
      });
    }
  }

  // A unit type appears once, so its count is the whole of it and its limit
  // cannot be dodged by splitting it over two entries.
  const seenUnitTypeIds = new Set<string>();
  for (const [index, unit] of army.units.entries()) {
    const unitTypeId = unit.unitType.id;
    if (seenUnitTypeIds.has(unitTypeId)) {
      ctx.addIssue({
        code: 'custom',
        message: 'An army cannot duplicate unit types.',
        path: [...pathPrefix, 'units', index, 'unitType'],
      });
    }
    seenUnitTypeIds.add(unitTypeId);
  }

  // An army holds one copy of each command card.
  const seenCommandCardIds = new Set<string>();
  for (const [index, card] of army.commandCards.entries()) {
    if (seenCommandCardIds.has(card.id)) {
      ctx.addIssue({
        code: 'custom',
        message: 'An army cannot duplicate command cards.',
        path: [...pathPrefix, 'commandCards', index],
      });
    }
    seenCommandCardIds.add(card.id);
  }
}

/**
 * Army schema with the rules that hold in every game mode. Use it where no
 * mode is chosen yet; {@link armySchemaForMode} adds the mode's composition.
 */
export const legalArmySchema: z.ZodType<Army> =
  armySchema.superRefine(refineArmyRules);
