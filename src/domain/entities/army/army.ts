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
  /** The name of the army. */
  name: string;
  /** The units in the army. */
  units: UnitCount[];
  /** The command cards in the army. */
  commandCards: CommandCard[];
}

const _armySchemaObject = z
  .object({
    /** The unique identifier of the army. */
    id: z.uuid(),
    /** The name of the army. */
    name: z.string(),
    /** The units in the army. */
    units: z.array(unitCountSchema),
    /** The command cards in the army. */
    commandCards: z.array(commandCardSchema),
  })
  .strict();

type ArmySchemaType = z.infer<typeof _armySchemaObject>;

/**
 * Shape-only schema for an army.
 * The rules every army keeps live in `@legality` (`refineArmyRules`), and so
 * do the mode composition limits (`refineArmyComposition`).
 */
export const armySchema: z.ZodType<Army> = _armySchemaObject;

// Verify manual type matches schema inference
const _assertExactArmy: AssertExact<Army, ArmySchemaType> = true;
