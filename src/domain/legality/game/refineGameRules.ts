import type { Army, Board, GameModeName } from '@entities';
import type { Game, GameForVisibility } from '@game';

import {
  authoritativeGameSchema,
  blackSeenGameSchema,
  gameSchema,
  spectatorGameSchema,
  whiteSeenGameSchema,
} from '@game';
import type { z } from 'zod';
import { refineBoardLayout } from '../board/refineBoardLayout';
import { refineGameArmyComposition } from './refineGameArmyComposition';

/** The parts of a game the game rules read. */
interface GameRulesInput {
  gameMode: GameModeName;
  whiteArmy: Army;
  blackArmy: Army;
  gameState: { boardState: Board };
}

/**
 * Adds Zod issues for every rule a whole game record must keep: a board laid
 * out for its size, and armies that keep the army rules and the mode's limits.
 */
export function refineGameRules(
  game: GameRulesInput,
  ctx: z.RefinementCtx,
): void {
  // The field is whole: every space of its size, and none from another size.
  refineBoardLayout(game.gameState.boardState, ctx, [
    'gameState',
    'boardState',
  ]);
  // Each side brought an army it was allowed to bring to this mode.
  refineGameArmyComposition(game, ctx);
}

/** Authoritative {@link Game} schema including the game rules. */
export const authoritativeGameWithArmyCompositionSchema: z.ZodType<
  GameForVisibility<'authoritative'>
> = authoritativeGameSchema.superRefine(refineGameRules);

/** White-seen {@link Game} schema including the game rules. */
export const whiteSeenGameWithArmyCompositionSchema: z.ZodType<
  GameForVisibility<'whiteSeen'>
> = whiteSeenGameSchema.superRefine(refineGameRules);

/** Black-seen {@link Game} schema including the game rules. */
export const blackSeenGameWithArmyCompositionSchema: z.ZodType<
  GameForVisibility<'blackSeen'>
> = blackSeenGameSchema.superRefine(refineGameRules);

/** Spectator {@link Game} schema including the game rules. */
export const spectatorGameWithArmyCompositionSchema: z.ZodType<
  GameForVisibility<'spectator'>
> = spectatorGameSchema.superRefine(refineGameRules);

/** Any-visibility {@link Game} schema including the game rules. */
export const gameWithArmyCompositionSchema: z.ZodType<Game> =
  gameSchema.superRefine(refineGameRules);
