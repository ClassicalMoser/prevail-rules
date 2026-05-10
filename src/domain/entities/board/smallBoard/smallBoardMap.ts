import type { AssertExact } from '@utils';
import type { z } from 'zod';
import type { BoardSpace } from '../boardSpace';
import type { SmallBoardCoordinate } from './smallCoordinates';

import { createBoardCoordinateMapSchema } from '../boardMap';
import { smallBoardCoordinates } from './smallCoordinates';

/**
 * A map of small board coordinates to board spaces.
 */
export type SmallBoardCoordinateMap = Record<SmallBoardCoordinate, BoardSpace>;

const _smallBoardCoordinateMapSchema: z.ZodObject<
  Record<SmallBoardCoordinate, z.ZodType<BoardSpace>>
> = createBoardCoordinateMapSchema(smallBoardCoordinates);

type SmallBoardCoordinateMapSchemaType = z.infer<
  typeof _smallBoardCoordinateMapSchema
>;

const _assertExactSmallBoardCoordinateMap: AssertExact<
  SmallBoardCoordinateMap,
  SmallBoardCoordinateMapSchemaType
> = true;

/**
 * The schema for the board coordinate map.
 */
export const smallBoardCoordinateMapSchema: z.ZodObject<
  Record<SmallBoardCoordinate, z.ZodType<BoardSpace>>
> = _smallBoardCoordinateMapSchema;
