import type { BoardSize } from '@entities';
import type { AssertExact } from '@utils';
import { boardSizeEnum } from '@entities';
import { z } from 'zod';

/** Iterable list of game types. */
export const gameType = ['standard', 'mini', 'tutorial'] as const;

/**
 * A type of game.
 */
export type GameType = (typeof gameType)[number];

const _gameTypeEnumSchemaObject = z.enum(gameType);
type GameTypeEnumType = z.infer<typeof _gameTypeEnumSchemaObject>;

/** The schema for a game type. */
export const gameTypeEnum: z.ZodType<GameType> = _gameTypeEnumSchemaObject;

// Verify manual type matches schema inference
const _assertExactGameType: AssertExact<GameType, GameTypeEnumType> = true;

/**
 * The structure of a game type.
 */
export interface GameTypeStructure {
  type: GameType;
  boardSize: BoardSize;
}

const _gameTypeStructureSchemaObject = z.object({
  type: gameTypeEnum,
  boardSize: boardSizeEnum,
});

type GameTypeStructureSchemaType = z.infer<
  typeof _gameTypeStructureSchemaObject
>;

/**
 * The schema for a game type structure.
 */
export const gameTypeStructureSchema: z.ZodType<GameTypeStructure> =
  _gameTypeStructureSchemaObject;

// Verify manual type matches schema inference
const _assertExactGameTypeStructure: AssertExact<
  GameTypeStructure,
  GameTypeStructureSchemaType
> = true;
