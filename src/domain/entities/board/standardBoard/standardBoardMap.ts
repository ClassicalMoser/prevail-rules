import type { AssertExact } from '@utils';
import type { z } from 'zod';
import type { BoardSpace } from '../boardSpace';
import type { StandardBoardCoordinate } from './standardCoordinates';

import { createBoardCoordinateMapSchema } from '../boardMap';
import { standardBoardCoordinates } from './standardCoordinates';

/**
 * A map of standard board coordinates to board spaces.
 */
export type StandardBoardCoordinateMap = Record<
  StandardBoardCoordinate,
  BoardSpace
>;

const _standardBoardCoordinateMapSchema: z.ZodObject<
  Record<StandardBoardCoordinate, z.ZodType<BoardSpace>>
> = createBoardCoordinateMapSchema(standardBoardCoordinates);

type StandardBoardCoordinateMapSchemaType = z.infer<
  typeof _standardBoardCoordinateMapSchema
>;

const _assertExactStandardBoardCoordinateMap: AssertExact<
  StandardBoardCoordinateMap,
  StandardBoardCoordinateMapSchemaType
> = true;

/**
 * The schema for the board coordinate map.
 */
export const standardBoardCoordinateMapSchema: z.ZodObject<
  Record<StandardBoardCoordinate, z.ZodType<BoardSpace>>
> = _standardBoardCoordinateMapSchema;
