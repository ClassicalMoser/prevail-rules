import type { PlayerSide, UnitType } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
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

const _unitInstanceSchemaObject = z.object({
  /** Which player the unit belongs to. */
  playerSide: playerSideSchema,
  /** The type of unit this is an instance of. */
  unitType: unitTypeSchema,
  /** Which instance of the unit this is. */
  instanceNumber: z.int().min(1).max(20),
});

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
