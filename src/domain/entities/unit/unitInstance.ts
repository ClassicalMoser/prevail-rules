import type { PlayerSide } from '@entities/player';
import type { AssertExact } from '@utils';
import type { UnitType } from './unitType';

import { playerSideSchema } from '@entities/player';
import { MAX_ARMY_UNIT_PER_TYPE_COUNT } from '@ruleValues';
import { z } from 'zod';
import { unitTypeSchema } from './unitType';

/**
 * An individual instance of a unit.
 */
export interface UnitInstance {
  /** Which player the unit belongs to. */
  playerSide: PlayerSide;
  /** The type of unit this is an instance of. */
  unitType: UnitType;
  /** Which instance of the unit this is. */
  instanceNumber: number;
}

const _unitInstanceSchemaObject = z
  .object({
    /** Which player the unit belongs to. */
    playerSide: playerSideSchema,
    /** The type of unit this is an instance of. */
    unitType: unitTypeSchema,
    /** Which instance of the unit this is. */
    // Copies are numbered from 1, and an army fields at most this many of
    // one type (§3.1.4).
    instanceNumber: z.int().min(1).max(MAX_ARMY_UNIT_PER_TYPE_COUNT),
  })
  .strict();

type UnitInstanceSchemaType = z.infer<typeof _unitInstanceSchemaObject>;

/**
 * The schema for a unit instance.
 */
export const unitInstanceSchema: z.ZodType<UnitInstance> =
  _unitInstanceSchemaObject;

// Verify manual type matches schema inference
const _assertExactUnitInstance: AssertExact<
  UnitInstance,
  UnitInstanceSchemaType
> = true;
