import type { Card } from '@entities/card';
import type { AssertExact } from '@utils';
import type { UnitCount } from './unitCount';

import { cardSchema } from '@entities/card';
import {
  LEGAL_INITIATIVES,
  MAX_ARMY_UNIT_COST,
  MIN_ARMY_MORALE_VALUE,
} from '@ruleValues';
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
  commandCards: Card[];
}

const _armySchemaObject = z
  .object({
    /** The unique identifier of the army. */
    id: z.uuid(),
    /** The units in the army. */
    units: z.array(unitCountSchema),
    /** The command cards in the army. */
    commandCards: z.array(cardSchema).length(12),
  })
  .refine(
    (data) => {
      const unitCost = data.units.reduce(
        (acc, unit) => acc + unit.count * unit.unitType.cost,
        0,
      );
      return unitCost <= MAX_ARMY_UNIT_COST;
    },
    {
      message: `An army must have a total unit cost of ${MAX_ARMY_UNIT_COST} or less.`,
      path: ['units'],
    },
  )
  .refine(
    (data) => {
      const moraleValue = data.units.reduce(
        (acc, unit) => acc + unit.count * unit.unitType.morale,
        0,
      );
      return moraleValue >= MIN_ARMY_MORALE_VALUE;
    },
    {
      message: `An army must have a total morale value of ${MIN_ARMY_MORALE_VALUE} or greater.`,
      path: ['units'],
    },
  )
  .refine(
    (data) => {
      const byInitiative = Object.groupBy(
        data.commandCards,
        (card) => card.initiative,
      );
      return LEGAL_INITIATIVES.every(
        (initiative) => (byInitiative[initiative]?.length ?? 0) === 3,
      );
    },
    {
      message:
        'An army must have exactly three command cards for each initiative.',
      path: ['commandCards'],
    },
  );

type ArmySchemaType = z.infer<typeof _armySchemaObject>;

/**
 * The schema for an army of troops.
 */
export const armySchema: z.ZodType<Army> = _armySchemaObject;

// Verify manual type matches schema inference
const _assertExactArmy: AssertExact<Army, ArmySchemaType> = true;
