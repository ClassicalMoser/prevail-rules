import type {
  Elevation,
  PlayerSide,
  TerrainType,
  UnitPresence,
  WaterCover,
} from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitPresenceSchema } from '@entities';
import { z } from 'zod';
import { elevationSchema } from './elevation';
import { terrainTypeSchema } from './terrainTypes';
import { waterCoverSchema } from './waterCover';

/**
 * A space of the game board.
 */
export interface BoardSpace {
  /**
   * The type of terrain in the space.
   */
  terrainType: TerrainType;
  /**
   * The elevation of the space.
   */
  elevation: Elevation;
  /**
   * The water cover of the space.
   */
  waterCover: WaterCover;
  /**
   * The unit presence in the space.
   */
  unitPresence: UnitPresence;
  /**
   * The commanders in the space.
   */
  commanders: Set<PlayerSide>;
}

const _boardSpaceSchemaObject = z.object({
  /**
   * The type of terrain in the space.
   */
  terrainType: terrainTypeSchema,
  /**
   * The elevation of the space.
   */
  elevation: elevationSchema,
  /**
   * The water cover of the space.
   */
  waterCover: waterCoverSchema,
  /**
   * The unit presence in the space.
   */
  unitPresence: unitPresenceSchema,
  /**
   * The commanders in the space.
   */
  commanders: z.set(playerSideSchema),
});

type boardSpaceSchemaType = z.infer<typeof _boardSpaceSchemaObject>;

/**
 * The schema for a space of the game board.
 */
export const boardSpaceSchema: z.ZodType<BoardSpace> = _boardSpaceSchemaObject;

// Verify manual type matches schema inference
const _assertExactBoardSpace: AssertExact<BoardSpace, boardSpaceSchemaType> =
  true;
