import type { Army, GameModeName } from '@entities';
import type { Event } from '@events';
import type { AssertExact } from '@utils';
import type { AuthoritativeGameState } from '@game/gameState';

import { armySchema, gameModeNameSchema } from '@entities';
import { eventSchema } from '@events';
import { z } from 'zod';
import { authoritativeGameStateSchema } from '@game/gameState';

/**
 * A game as the server keeps it: who plays, with which armies, in which mode,
 * and the full state of play. It is the authoritative record. A player or a
 * spectator is sent a `ProjectedGame` instead, built by
 * `projectGameForVisibility`: no armies, since each lists a hand only its own
 * seat may read, and the opening state, events and current state in that view.
 *
 * Board size lives on `gameState.boardState.boardType` and must agree with
 * the size required by `gameMode` (enforced by Zod).
 * TODO(misleading): {@link gameSchema} itself does not check this; the check is
 * `refineGameModeBoardSize` in `@legality`, a refine applied on top of it.
 * Settled by saying where the check lives.
 *
 * Mode army composition limits live in `@legality` (`refineGameArmyComposition`).
 */
export interface Game {
  /** The mode being played, which sets the board and the army limits (§3.1.3). */
  gameMode: GameModeName;
  /** The full state of play, both hands in view. */
  gameState: AuthoritativeGameState;
  /** The unique identifier of the game. */
  id: string;
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: string;
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: string;
  /** The army brought by the black player. */
  blackArmy: Army;
  /** The army brought by the white player. */
  whiteArmy: Army;
  /**
   * Every event of the game, in the order it was applied: round 0 (setup)
   * first, and each round closed by its `roundEnd`. This is the game's
   * record. Replaying it from the armies and the mode gives every state the
   * game has passed through; `gameState` is the latest of them, kept so the
   * game loads without a replay.
   */
  events: readonly Event[];
}

const _gameSchemaObject = z
  .object({
    blackArmy: armySchema,
    blackPlayer: z.uuid(),
    events: z.array(eventSchema).readonly(),
    gameMode: gameModeNameSchema,
    gameState: authoritativeGameStateSchema,
    id: z.uuid(),
    whiteArmy: armySchema,
    whitePlayer: z.uuid(),
  })
  .strict();

type GameSchemaType = z.infer<typeof _gameSchemaObject>;

/** Schema for {@link Game}. */
export const gameSchema: z.ZodType<Game> = _gameSchemaObject;

const _assertExactGame: AssertExact<Game, GameSchemaType> = true;
