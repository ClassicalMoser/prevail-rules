import type { Board } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { GameStateWithBoard } from '@game';
import { getCurrentPhaseState } from '@queries/sequencing';
import {
  getExpectedCleanupPhaseEvent,
  getExpectedIssueCommandsPhaseEvent,
  getExpectedMoveCommandersPhaseEvent,
  getExpectedPlayCardsPhaseEvent,
  getExpectedResolveMeleePhaseEvent,
} from './byPhase';

/** ExpectedEventInfo enriched with the next event number derived from state. */
export type ExpectedEvent = ExpectedEventInfo & {
  eventNumber: number;
};

export function getExpectedEvent<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
): ExpectedEvent {
  const phaseState = getCurrentPhaseState(state);
  const eventNumber = state.currentRoundState.events.length;

  let info: ExpectedEventInfo;
  switch (phaseState.phase) {
    case 'playCards':
      info = getExpectedPlayCardsPhaseEvent(state);
      break;
    case 'moveCommanders':
      info = getExpectedMoveCommandersPhaseEvent(state);
      break;
    case 'issueCommands':
      info = getExpectedIssueCommandsPhaseEvent(state);
      break;
    case 'resolveMelee':
      info = getExpectedResolveMeleePhaseEvent(state);
      break;
    case 'cleanup':
      info = getExpectedCleanupPhaseEvent(state);
      break;
    default:
      throw new Error('Invalid phase');
  }

  return { ...info, eventNumber };
}
