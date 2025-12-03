import type { BoardSize } from '@entities';
import type { AssertExact } from '@utils';
import { boardSizeEnum } from '@entities';
import { z } from 'zod';

export const gameType = ['standard', 'mini', 'tutorial'] as const;

export const gameTypeEnum: z.ZodType<GameType> = z.enum(gameType);

type GameTypeEnumType = z.infer<typeof gameTypeEnum>;

/**
 * A type of game.
 */
export type GameType = (typeof gameType)[number];

/**
 * Check that the game type type matches the schema.
 */
const _assertExactGameType: AssertExact<GameType, GameTypeEnumType> = true;

export const gameTypeStructureSchema: z.ZodType<GameTypeStructure> = z.object({
  type: gameTypeEnum,
  boardSize: boardSizeEnum,
});

type GameTypeStructureSchemaType = z.infer<typeof gameTypeStructureSchema>;

/**
 * The structure of a game type.
 */
export interface GameTypeStructure {
  type: GameType;
  boardSize: BoardSize;
}

/**
 * Assert that the game type structure matches the schema.
 */
const _assertExactGameTypeStructure: AssertExact<
  GameTypeStructure,
  GameTypeStructureSchemaType
> = true;
