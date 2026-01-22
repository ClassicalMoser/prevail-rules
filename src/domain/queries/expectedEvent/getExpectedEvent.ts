import type { Board, ExpectedEventInfo, GameState } from '@entities';
import { getExpectedCleanupPhaseEvent } from './getExpectedCleanupPhaseEvent';
import { getExpectedIssueCommandsPhaseEvent } from './getExpectedIssueCommandsPhaseEvent';
import { getExpectedMoveCommandersPhaseEvent } from './getExpectedMoveCommandersPhaseEvent';
import { getExpectedPlayCardsPhaseEvent } from './getExpectedPlayCardsPhaseEvent';

export function getExpectedEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ExpectedEventInfo<TBoard> {
  const roundState = state.currentRoundState;
  if (!roundState) {
    throw new Error('No round state found');
  }
  if (!roundState.currentPhaseState) {
    throw new Error('No current phase state found');
  }
  switch (roundState.currentPhaseState.phase) {
    case 'playCards':
      return getExpectedPlayCardsPhaseEvent(state);
    case 'moveCommanders':
      return getExpectedMoveCommandersPhaseEvent(state);
    case 'issueCommands':
      return getExpectedIssueCommandsPhaseEvent(state);
    case 'resolveMelee':
      throw new Error('ResolveMelee phase not implemented');
    case 'cleanup':
      return getExpectedCleanupPhaseEvent(state);
    default:
      throw new Error('Invalid phase');
  }
}
