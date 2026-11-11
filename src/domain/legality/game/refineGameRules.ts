import type { Army, Board, GameModeName } from '@entities';
import type { Game, GameStateForVisibility } from '@game';

import { authoritativeGameStateSchema, gameSchema } from '@game';
import type { z } from 'zod';
import { refineBoardLayout } from '../board/refineBoardLayout';
import { refineGameArmyComposition } from './refineGameArmyComposition';
import { refineGameModeBoardSize } from './refineGameModeBoardSize';

/** The parts of a game the game rules read. */
interface GameRulesInput {
  gameMode: GameModeName;
  whiteArmy: Army;
  blackArmy: Army;
  gameState: { boardState: Board };
}

/**
 * Adds Zod issues for every rule a whole game record must keep: a board of
 * the mode's size laid out for that size, and armies that keep the army rules
 * and the mode's limits.
 */
export function refineGameRules(
  game: GameRulesInput,
  ctx: z.RefinementCtx,
): void {
  // The game is played on the board size its mode calls for.
  refineGameModeBoardSize(game, ctx);
  // The field is whole: every space of its size, and none from another size.
  refineBoardLayout(game.gameState.boardState, ctx, [
    'gameState',
    'boardState',
  ]);
  // Each side brought an army it was allowed to bring to this mode.
  refineGameArmyComposition(game, ctx);
}

/** {@link Game} schema including the game rules. */
export const legalGameSchema: z.ZodType<Game> =
  gameSchema.superRefine(refineGameRules);

/**
 * The schema for an authoritative game state of a game played in `gameMode`,
 * including the rules that need the mode: a board laid out for its size, and
 * the size the mode is played on. It is what a round snapshot must satisfy.
 *
 * @param gameMode - The mode the state's game is played in
 * @returns A schema that accepts only a legal state for that mode
 */
export function legalGameStateSchema(
  gameMode: GameModeName,
): z.ZodType<GameStateForVisibility<'authoritative'>> {
  const schema = authoritativeGameStateSchema.superRefine((state, ctx) => {
    refineGameModeBoardSize({ gameMode, gameState: state }, ctx, [
      'boardState',
      'boardType',
    ]);
    refineBoardLayout(state.boardState, ctx, ['boardState']);
  });
  return schema;
}
