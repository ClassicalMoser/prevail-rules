import type { Board } from '@entities/board';
import type { CardState } from '@entities/card';
import type { PlayerSide } from '@entities/player';
import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import type { RoundState } from './roundState';

import { boardSchema } from '@entities/board';
import { cardStateSchema } from '@entities/card';
import { playerSideSchema } from '@entities/player';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';
import { roundStateSchema } from './roundState';

/** The state of a game of Prevail: Ancient Battles. */
export interface GameState {
  /** The current round number of the game. */
  currentRoundNumber: number;
  /** The state of the current round of the game. */
  currentRoundState: RoundState;
  /** Which player currently has initiative. */
  currentInitiative: PlayerSide;
  /** The state of the board. */
  boardState: Board;
  /** The state of both players' cards. */
  cardState: CardState;
  /** The units that have been defeated during the game. */
  defeatedUnits: Set<UnitInstance>;
}

const _gameStateSchemaObject = z.object({
  /** The current round number of the game. */
  currentRoundNumber: z.int().min(0),
  /** The state of the current round of the game. */
  currentRoundState: roundStateSchema,
  /** Which player currently has initiative. */
  currentInitiative: playerSideSchema,
  /** The state of the board. */
  boardState: boardSchema,
  /** The state of both players' cards. */
  cardState: cardStateSchema,
  /** The units that have been defeated during the game. */
  defeatedUnits: z.set(unitInstanceSchema),
});

type GameStateSchemaType = z.infer<typeof _gameStateSchemaObject>;

const _assertExactGameState: AssertExact<GameState, GameStateSchemaType> = true;

/** The schema for the state of a game of Prevail: Ancient Battles. */
export const gameStateSchema: z.ZodType<GameState> = _gameStateSchemaObject;
