import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

/**
 * Whether this player holds the initiative, and so acts first.
 *
 * Initiative is always held by one side or the other — it moves between rounds
 * and never lapses — so "has initiative" and "is the first player" are the same
 * question, and state that is keyed by order is read through this.
 *
 * Which colour starts the game with it is a rule of the version being played,
 * not a property of the colours, which is why nothing outside the opening game
 * state names a side for it.
 *
 * @param state - The game state
 * @param player - The player to ask about
 * @returns Whether that player is the first player this round
 */
export function hasInitiative(state: GameState, player: PlayerSide): boolean {
  const isFirstPlayer = state.currentInitiative === player;
  return isFirstPlayer;
}
