import type { Army, Board, GameModeName } from '@entities';
import type { Game } from '@game';

import { gameSchema } from '@game';
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
