import type { AssertExact } from '@utils';
import type { Card } from '../card';
import type { UnitCount } from './unitCount';

import { z } from 'zod';
import { cardSchema } from '../card';
import { unitCountSchema } from './unitCount';

/**
 * An army of troops.
 */
export interface Army {
  /** The unique identifier of the army. */
  id: string;
  /** The units in the army. */
  units: Set<UnitCount>;
  /** The command cards in the army. */
  commandCards: Set<Card>;
}

const _armySchemaObject = z.object({
  /** The unique identifier of the army. */
  id: z.uuid(),
  /** The units in the army. */
  units: z.set(unitCountSchema),
  /** The command cards in the army. */
  commandCards: z.set(cardSchema),
});

type ArmySchemaType = z.infer<typeof _armySchemaObject>;

/**
 * The schema for an army of troops.
 */
export const armySchema: z.ZodType<Army> = _armySchemaObject;

// Verify manual type matches schema inference
const _assertExactArmy: AssertExact<Army, ArmySchemaType> = true;
