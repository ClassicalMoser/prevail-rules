import type { Board, UnitInstance, UnitPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitInstanceSchema, unitPlacementSchema } from '@entities';
import { z } from 'zod';
export const unitWithPlacementSchema = z.object({
  unit: unitInstanceSchema,
  placement: unitPlacementSchema,
});

export type UnitWithPlacementSchemaType = z.infer<
  typeof unitWithPlacementSchema
>;

export interface UnitWithPlacement<TBoard extends Board> {
  unit: UnitInstance;
  placement: UnitPlacement<TBoard>;
}

export const _assertExactUnitWithPlacement: AssertExact<
  UnitWithPlacement<any>,
  UnitWithPlacementSchemaType
> = true;
