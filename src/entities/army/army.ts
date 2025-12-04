import type { Card, UnitCount } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, unitCountSchema } from '@entities';
import { z } from 'zod';

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
  id: z.string().uuid(),
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
