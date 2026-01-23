import type { Board, ExpectedEventInfo, GameState } from '@entities';
import { getCurrentPhaseState } from '@queries/sequencing';
import {
  getExpectedCleanupPhaseEvent,
  getExpectedIssueCommandsPhaseEvent,
  getExpectedMoveCommandersPhaseEvent,
  getExpectedPlayCardsPhaseEvent,
  getExpectedResolveMeleePhaseEvent,
} from './byPhase';

export function getExpectedEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ExpectedEventInfo<TBoard> {
  const phaseState = getCurrentPhaseState(state);
  switch (phaseState.phase) {
    case 'playCards':
      return getExpectedPlayCardsPhaseEvent(state);
    case 'moveCommanders':
      return getExpectedMoveCommandersPhaseEvent(state);
    case 'issueCommands':
      return getExpectedIssueCommandsPhaseEvent(state);
    case 'resolveMelee':
      return getExpectedResolveMeleePhaseEvent(state);
    case 'cleanup':
      return getExpectedCleanupPhaseEvent(state);
    default:
      throw new Error('Invalid phase');
  }
}
