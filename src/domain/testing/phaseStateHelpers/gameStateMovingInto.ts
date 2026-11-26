import type { EngagementState, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { createGameStateResolvingCommand } from './gameStateResolvingCommand';
import { createMovementResolutionState } from './movementResolutionState';

/**
 * A game in Phase 3 carrying out a Move whose unit has walked into an enemy
 * with this engagement, or has not met anyone yet (`'pending'`).
 *
 * @param engagementState - The engagement the move reached
 * @returns An empty standard game carrying out that move
 */
export function createGameStateMovingInto(
  engagementState: EngagementState | 'pending',
): GameState {
  // The move, holding the engagement its unit walked into.
  const empty = createEmptyGameState('standard');
  const movement = createMovementResolutionState(empty, { engagementState });

  // That move is the order being carried out.
  const moving = createGameStateResolvingCommand(movement, empty);
  return moving;
}
