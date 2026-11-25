import type { Army } from '@entities';
import type { GameModeName } from '@ruleValues';
import { armySchema } from '@entities';
import type { z } from 'zod';

import { getArmyCompositionStatus } from './getArmyCompositionStatus';
import { refineArmyRules } from './refineArmyRules';

/**
 * Adds Zod issues for army composition rules that fail for `mode`.
 * Null rule fields are skipped (tutorial / arbitrary lists).
 *
 * @param army - The army list
 * @param mode - The game mode it is built for
 * @param ctx - Where to add each issue
 * @param pathPrefix - Where the army sits in a larger value, such as
 * `['whiteArmy']` in a game, so each issue points at the right army
 */
export function refineArmyComposition(
  army: Army,
  mode: GameModeName,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  // The army measured once against each of its mode's limits; this refine
  // only words the ones it does not meet.
  const status = getArmyCompositionStatus(army, mode);

  // The mode's name as a player reads it at the head of a sentence
  // ("Mini armies ..."), so each message names the limits it broke.
  const modeLabel = `${mode.charAt(0).toUpperCase()}${mode.slice(1)}`;

  // Too many different unit types for the mode (§3.1.3).
  if (!status.unitTypeCount.met) {
    ctx.addIssue({
      code: 'custom',
      message: `${modeLabel} armies may include at most ${status.unitTypeCount.limit} different unit types.`,
      path: [...pathPrefix, 'units'],
    });
  }

  // Units and cards together cost more than the mode's cap (§3.1.3).
  if (!status.cost.met) {
    ctx.addIssue({
      code: 'custom',
      message: `${modeLabel} armies cannot cost more than ${status.cost.limit}.`,
      path: pathPrefix,
    });
  }

  // Total Morale falls short of the mode's floor (§3.1.6).
  if (!status.morale.met) {
    ctx.addIssue({
      code: 'custom',
      message: `${modeLabel} armies must have a total morale value of ${status.morale.limit} or greater.`,
      path: [...pathPrefix, 'units'],
    });
  }

  // Cards are not spread evenly across every initiative value (§3.1.7).
  if (!status.cardsPerInitiative.met) {
    ctx.addIssue({
      code: 'custom',
      message: `${modeLabel} armies must have exactly ${status.cardsPerInitiative.limit} command cards for each initiative.`,
      path: [...pathPrefix, 'commandCards'],
    });
  }
}

/**
 * Army schema with composition refinements for a specific game mode.
 *
 * @param mode - The game mode the list is built for
 * @returns A schema that accepts only a list legal in that mode
 */
export function armySchemaForMode(mode: GameModeName): z.ZodType<Army> {
  const schema = armySchema.superRefine((army, ctx) => {
    // The rules every army keeps, whatever the mode.
    refineArmyRules(army, ctx);
    // The limits this mode adds on top.
    refineArmyComposition(army, mode, ctx);
  });

  // A list legal in this mode: well formed, keeping the army rules and the
  // mode's limits.
  return schema;
}
