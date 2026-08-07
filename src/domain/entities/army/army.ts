import type { Card } from '@entities/card';
import type { AssertExact } from '@utils';
import type { GameModeName } from '@entities/gameModes';
import type { UnitCount } from './unitCount';

import { cardSchema } from '@entities/card';
import { z } from 'zod';
import {
  armyCompositionByMode,
  armyCompositionInitiatives,
} from './armyComposition';
import { unitCountSchema } from './unitCount';

/**
 * An army of troops.
 */
export interface Army {
  /** The unique identifier of the army. */
  id: string;
  /** The units in the army. */
  units: UnitCount[];
  /** The command cards in the army. */
  commandCards: Card[];
}

const _armySchemaObject = z.object({
  /** The unique identifier of the army. */
  id: z.uuid(),
  /** The units in the army. */
  units: z.array(unitCountSchema),
  /** The command cards in the army. */
  commandCards: z.array(cardSchema),
});

type ArmySchemaType = z.infer<typeof _armySchemaObject>;

/**
 * Shape-only schema for an army. Mode composition limits are applied via
 * {@link refineArmyComposition}, {@link armySchemaForMode}, or Game.superRefine.
 */
export const armySchema: z.ZodType<Army> = _armySchemaObject;

// Verify manual type matches schema inference
const _assertExactArmy: AssertExact<Army, ArmySchemaType> = true;

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

  for (const [index, unit] of army.units.entries()) {
    if (unit.count > rules.maxUnitTypeCount) {
      ctx.addIssue({
        code: 'custom',
        message: `${modeLabel} armies may include at most ${rules.maxUnitTypeCount} of a given unit type.`,
        path: [...pathPrefix, 'units', index, 'count'],
      });
    }
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
  return _armySchemaObject.superRefine((army, ctx) => {
    refineArmyComposition(army, mode, ctx);
  });
}
