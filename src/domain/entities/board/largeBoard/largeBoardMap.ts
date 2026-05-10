import type { AssertExact } from '@utils';
import type { z } from 'zod';
import type { BoardSpace } from '../boardSpace';
import type { LargeBoardCoordinate } from './largeCoordinates';

import { createBoardCoordinateMapSchema } from '../boardMap';
import { largeBoardCoordinates } from './largeCoordinates';

/**
 * A map of large board coordinates to board spaces.
 */
export type LargeBoardCoordinateMap = Record<LargeBoardCoordinate, BoardSpace>;

const _largeBoardCoordinateMapSchema: z.ZodObject<
  Record<LargeBoardCoordinate, z.ZodType<BoardSpace>>
> = createBoardCoordinateMapSchema(largeBoardCoordinates);

type LargeBoardCoordinateMapSchemaType = z.infer<
  typeof _largeBoardCoordinateMapSchema
>;

const _assertExactLargeBoardCoordinateMap: AssertExact<
  LargeBoardCoordinateMap,
  LargeBoardCoordinateMapSchemaType
> = true;

/**
 * The schema for the board coordinate map.
 */
export const largeBoardCoordinateMapSchema: z.ZodObject<
  Record<LargeBoardCoordinate, z.ZodType<BoardSpace>>
> = _largeBoardCoordinateMapSchema;
