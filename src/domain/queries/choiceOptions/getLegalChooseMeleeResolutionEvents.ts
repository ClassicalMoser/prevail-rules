import type { Board, BoardCoordinate } from '@entities';
import type { ChooseMeleeResolutionEvent } from '@events';
import type { GameState } from '@game';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import {
  getCurrentInitiative,
  getNextEventNumber,
  getRemainingMeleeEngagements,
  getResolveMeleePhaseState,
} from '@queries/sequencing';

export function getLegalChooseMeleeResolutionEvents<TBoard extends Board>(
  gameState: GameState<TBoard>,
): ChooseMeleeResolutionEvent<TBoard>[] {
  const phaseState = getResolveMeleePhaseState(gameState);
  if (phaseState.step !== 'resolveMelee') {
    throw new Error('Not in resolve melee phase');
  }

  // Get the next event number
  const eventNumber = getNextEventNumber(gameState);

  // Get the active player
  const activePlayer = getCurrentInitiative(gameState);

  // Get the remaining engagements
  const remainingEngagementCoordinates =
    getRemainingMeleeEngagements(phaseState);

  // Build the result
  const result: ChooseMeleeResolutionEvent<TBoard>[] = [];

  // For each remaining engagement, add a legal choose melee resolution event
  for (const engagementCoordinate of remainingEngagementCoordinates) {
    result.push({
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      choiceType: 'chooseMeleeResolution',
      eventNumber,
      player: activePlayer,
      boardType: phaseState.boardType,
      space: engagementCoordinate as BoardCoordinate<TBoard>,
    } as unknown as ChooseMeleeResolutionEvent<TBoard>);
  }

  // If there are no legal choose melee resolution events,
  // we should have moved to the next step
  if (result.length === 0) {
    throw new Error('No legal choose melee resolution events');
  }

  // Build the result
  return result;
}
