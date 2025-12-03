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
 * The schema for a space of the game board.
 */
export const boardSpaceSchema = z.object({
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

// Helper type to check match of type against schema
type boardSpaceSchemaType = z.infer<typeof boardSpaceSchema>;

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

const _assertExactBoardSpace: AssertExact<BoardSpace, boardSpaceSchemaType> =
  true;
