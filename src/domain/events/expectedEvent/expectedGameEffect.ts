import type { GameEffectType } from '@ruleValues';

/**
 * The next event is a game effect: the rules decide it, and no player is
 * asked. It names only which effect; the procedure for that effect works out
 * the rest from the state, board included ({@link GameEffectEvent}).
 */
export interface ExpectedGameEffect {
  /** Marks a game effect, not a player choice. */
  actionType: 'gameEffect';
  /** Which effect comes next. */
  effectType: GameEffectType;
}
