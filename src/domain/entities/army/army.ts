import type { CommandCard } from '@entities/card';
import type { AssertExact } from '@utils';
import type { UnitCount } from './unitCount';

import { commandCardSchema } from '@entities/card';
import { z } from 'zod';
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
  commandCards: CommandCard[];
}

const _armySchemaObject = z
  .object({
    /** The unique identifier of the army. */
    id: z.uuid(),
    /** The units in the army. */
    units: z.array(unitCountSchema),
    /** The command cards in the army. */
    commandCards: z.array(commandCardSchema),
  })
  .strict()
  .superRefine((army, ctx) => {
    const seenUnitTypeIds = new Set<string>();
    for (const [index, unit] of army.units.entries()) {
      const unitTypeId = unit.unitType.id;
      if (seenUnitTypeIds.has(unitTypeId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'An army cannot duplicate unit types.',
          path: ['units', index, 'unitType'],
        });
      }
      seenUnitTypeIds.add(unitTypeId);
    }

    const seenCommandCardIds = new Set<string>();
    for (const [index, card] of army.commandCards.entries()) {
      if (seenCommandCardIds.has(card.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'An army cannot duplicate command cards.',
          path: ['commandCards', index],
        });
      }
      seenCommandCardIds.add(card.id);
    }
  });

type ArmySchemaType = z.infer<typeof _armySchemaObject>;

/**
 * Shape-only schema for an army (plus uniqueness of unit types / command cards).
 * Mode composition limits live in `@legality` (`refineArmyComposition`).
 */
export const armySchema: z.ZodType<Army> = _armySchemaObject;

// Verify manual type matches schema inference
const _assertExactArmy: AssertExact<Army, ArmySchemaType> = true;
