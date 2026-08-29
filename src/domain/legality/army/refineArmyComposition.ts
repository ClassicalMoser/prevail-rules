import type { Army, GameModeName } from '@entities';
import { armySchema } from '@entities';
import { z } from 'zod';

import {
  armyCompositionByMode,
  armyCompositionInitiatives,
} from './armyComposition';

/**
 * Adds Zod issues for army composition rules that fail for {@link mode}.
 * Null rule fields are skipped (tutorial / arbitrary lists).
 */
export function refineArmyComposition(
  army: Army,
  mode: GameModeName,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  const rules = armyCompositionByMode[mode];
  const modeLabel = `${mode.charAt(0).toUpperCase()}${mode.slice(1)}`;

  if (army.units.length > rules.maxUnitTypeCount) {
    ctx.addIssue({
      code: 'custom',
      message: `${modeLabel} armies may include at most ${rules.maxUnitTypeCount} different unit types.`,
      path: [...pathPrefix, 'units'],
    });
  }

  if (rules.maxUnitCost !== null) {
    const unitCost = army.units.reduce(
      (acc, unit) => acc + unit.count * unit.unitType.cost,
      0,
    );
    if (unitCost > rules.maxUnitCost) {
      ctx.addIssue({
        code: 'custom',
        message: `${modeLabel} armies cannot cost more than ${rules.maxUnitCost}.`,
        path: [...pathPrefix, 'units'],
      });
    }
  }

  if (rules.minMoraleValue !== null) {
    const moraleValue = army.units.reduce(
      (acc, unit) => acc + unit.count * unit.unitType.morale,
      0,
    );
    if (moraleValue < rules.minMoraleValue) {
      ctx.addIssue({
        code: 'custom',
        message: `${modeLabel} armies must have a total morale value of ${rules.minMoraleValue} or greater.`,
        path: [...pathPrefix, 'units'],
      });
    }
  }

  if (rules.cardsPerInitiative !== null) {
    const byInitiative = Object.groupBy(
      army.commandCards,
      (card) => card.initiative,
    );
    const balanced = armyCompositionInitiatives.every(
      (initiative) =>
        (byInitiative[initiative]?.length ?? 0) === rules.cardsPerInitiative,
    );
    if (!balanced) {
      ctx.addIssue({
        code: 'custom',
        message: `${modeLabel} armies must have exactly ${rules.cardsPerInitiative} command cards for each initiative.`,
        path: [...pathPrefix, 'commandCards'],
      });
    }
  }
}

/**
 * Army schema with composition refinements for a specific game mode.
 */
export function armySchemaForMode(mode: GameModeName): z.ZodType<Army> {
  return armySchema.superRefine((army, ctx) => {
    refineArmyComposition(army, mode, ctx);
  });
}
