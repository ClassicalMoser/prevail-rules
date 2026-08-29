import type { Army, GameModeName } from '@entities';
import type { Game, GameForVisibility } from '@game';

import {
  authoritativeGameSchema,
  blackSeenGameSchema,
  gameSchema,
  whiteSeenGameSchema,
} from '@game';
import type { z } from 'zod';
import { refineArmyComposition } from '../army/refineArmyComposition';

interface GameArmies {
  gameMode: GameModeName;
  whiteArmy: Army;
  blackArmy: Army;
}

/**
 * Adds Zod issues when either army fails mode composition rules.
 */
export function refineGameArmyComposition(
  game: GameArmies,
  ctx: z.RefinementCtx,
): void {
  refineArmyComposition(game.whiteArmy, game.gameMode, ctx, ['whiteArmy']);
  refineArmyComposition(game.blackArmy, game.gameMode, ctx, ['blackArmy']);
}

/** Authoritative {@link Game} schema including army composition limits. */
export const authoritativeGameWithArmyCompositionSchema: z.ZodType<
  GameForVisibility<'authoritative'>
> = authoritativeGameSchema.superRefine(refineGameArmyComposition);

/** White-seen {@link Game} schema including army composition limits. */
export const whiteSeenGameWithArmyCompositionSchema: z.ZodType<
  GameForVisibility<'whiteSeen'>
> = whiteSeenGameSchema.superRefine(refineGameArmyComposition);

/** Black-seen {@link Game} schema including army composition limits. */
export const blackSeenGameWithArmyCompositionSchema: z.ZodType<
  GameForVisibility<'blackSeen'>
> = blackSeenGameSchema.superRefine(refineGameArmyComposition);

/** Any-visibility {@link Game} schema including army composition limits. */
export const gameWithArmyCompositionSchema: z.ZodType<Game> =
  gameSchema.superRefine(refineGameArmyComposition);
