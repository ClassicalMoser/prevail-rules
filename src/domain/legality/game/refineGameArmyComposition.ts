import type { Army, GameModeName } from '@entities';
import type { z } from 'zod';
import { refineArmyComposition } from '../army/refineArmyComposition';
import { refineArmyRules } from '../army/refineArmyRules';

/** The parts of a game its army check reads: the mode and both sides' lists. */
interface GameArmies {
  gameMode: GameModeName;
  whiteArmy: Army;
  blackArmy: Army;
}

/**
 * Adds Zod issues when either army breaks the army rules or fails mode
 * composition rules.
 *
 * Each side builds its own list (§3.1), so each is checked on its own and
 * each issue points at the army it belongs to. `refineGameRules` runs this
 * for a whole game record.
 *
 * @param game - The mode and both armies
 * @param ctx - Where to add each issue
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
