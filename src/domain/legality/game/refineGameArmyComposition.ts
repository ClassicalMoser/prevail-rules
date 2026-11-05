import type { Army, GameModeName } from '@entities';
import type { Game, GameForVisibility } from '@game';

import {
  authoritativeGameSchema,
  blackSeenGameSchema,
  gameSchema,
  spectatorGameSchema,
  whiteSeenGameSchema,
} from '@game';
import type { z } from 'zod';
import { refineArmyComposition } from '../army/refineArmyComposition';
import { refineArmyRules } from '../army/refineArmyRules';

interface GameArmies {
  gameMode: GameModeName;
  whiteArmy: Army;
  blackArmy: Army;
}

/**
 * Adds Zod issues when either army breaks the army rules or fails mode
 * composition rules.
 */
export function refineGameArmyComposition(
  game: GameArmies,
  ctx: z.RefinementCtx,
): void {
  // Each side's army keeps the rules every army keeps.
  refineArmyRules(game.whiteArmy, ctx, ['whiteArmy']);
  refineArmyRules(game.blackArmy, ctx, ['blackArmy']);
  // Each side's army fits the limits of the mode being played.
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

/** Spectator {@link Game} schema including army composition limits. */
export const spectatorGameWithArmyCompositionSchema: z.ZodType<
  GameForVisibility<'spectator'>
> = spectatorGameSchema.superRefine(refineGameArmyComposition);

/** Any-visibility {@link Game} schema including army composition limits. */
export const gameWithArmyCompositionSchema: z.ZodType<Game> =
  gameSchema.superRefine(refineGameArmyComposition);
