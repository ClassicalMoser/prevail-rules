import type { GameEffectType } from '@ruleValues';

/**
 * The next event is a game effect: the rules decide it, and no player is
 * asked. It names only which effect; the procedure for that effect works out
 * the rest from the state, board included ({@link GameEffectEvent}).
 */
// TODO(misleading): GameEffectEvent is not imported here, so the link does not resolve.
export interface ExpectedGameEffect {
  /** Marks a game effect, not a player choice. */
  actionType: 'gameEffect';
  /** Which effect comes next. */
  effectType: GameEffectType;
}
