import type { Coordinate } from '@entities';
import type { ChooseMeleeResolutionEvent } from '@events';
import type { GameState } from '@game';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import {
  getCurrentInitiative,
  getNextEventNumber,
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

  // Get the next event number
  const eventNumber = getNextEventNumber(gameState as GameState);

  // Get the active player
  const activePlayer = getCurrentInitiative(gameState as GameState);

  // Get the remaining engagements
  const remainingEngagementCoordinates =
    getRemainingMeleeEngagements(phaseState);

  // Build the result
  const result: ChooseMeleeResolutionEvent[] = [];

  // For each remaining engagement, add a legal choose melee resolution event
  for (const engagementCoordinate of remainingEngagementCoordinates) {
    result.push({
      choiceType: 'chooseMeleeResolution',
      eventNumber,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      player: activePlayer,
      space: engagementCoordinate as Coordinate,
    });
  }

  // If there are no legal choose melee resolution events,
  // We should have moved to the next step
  if (result.length === 0) {
    throw new Error('No legal choose melee resolution events');
  }

  // Build the result
  return result;
}
