import type { Army, GameModeName } from '@entities';
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
