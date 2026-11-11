import type { ChooseMeleeResolutionEvent } from '@events';
import type { GameState } from '@game';
import { createChooseMeleeResolutionEvent } from '@factories';
import {
  getCurrentInitiative,
  getRemainingMeleeEngagements,
  getResolveMeleePhaseState,
} from '@queries';

export function getLegalChooseMeleeResolutionEvents(
  gameState: GameState,
): ChooseMeleeResolutionEvent[] {
  const phaseState = getResolveMeleePhaseState(gameState);
  if (phaseState.step !== 'resolveMelee') {
    throw new Error('Not in resolve melee phase');
  }

  // Get the active player
  const activePlayer = getCurrentInitiative(gameState);

  // Get the remaining engagements
  const remainingEngagementCoordinates =
    getRemainingMeleeEngagements(phaseState);

  // Build the result
  const result: ChooseMeleeResolutionEvent[] = [];

  // For each remaining engagement, add a legal choose melee resolution event
  for (const engagementCoordinate of remainingEngagementCoordinates) {
    result.push(
      createChooseMeleeResolutionEvent({
        player: activePlayer,
        space: engagementCoordinate,
      }),
    );
  }

  // If there are no legal choose melee resolution events,
  // We should have moved to the next step
  if (result.length === 0) {
    throw new Error('No legal choose melee resolution events');
  }

  // Build the result
  return result;
}
