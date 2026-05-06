import type { ExpectedEvent, ExpectedEventInfo } from "@events";
import type { GameState } from "@game";
import { getCurrentPhaseState } from "@queries/sequencing";
import {
  getExpectedCleanupPhaseEvent,
  getExpectedIssueCommandsPhaseEvent,
  getExpectedMoveCommandersPhaseEvent,
  getExpectedPlayCardsPhaseEvent,
  getExpectedResolveMeleePhaseEvent,
} from "./byPhase";

/**
 * Dispatcher function to identify which event to expect next.
 *
 * @param state - The game state, only argument required.
 * @returns Discriminator information to identify which event and number to expect next,
 * as well as which player(s) to expect input from.
 */
export function getExpectedEvent(state: GameState): ExpectedEvent {
  const phaseState = getCurrentPhaseState(state);
  const eventNumber = state.currentRoundState.events.length;

  let info: ExpectedEventInfo;
  switch (phaseState.phase) {
    case "playCards":
      info = getExpectedPlayCardsPhaseEvent(state);
      break;
    case "moveCommanders":
      info = getExpectedMoveCommandersPhaseEvent(state);
      break;
    case "issueCommands":
      info = getExpectedIssueCommandsPhaseEvent(state);
      break;
    case "resolveMelee":
      info = getExpectedResolveMeleePhaseEvent(state);
      break;
    case "cleanup":
      info = getExpectedCleanupPhaseEvent(state);
      break;
    default:
      throw new Error("Invalid phase");
  }
  const expectedEvent: ExpectedEvent = { ...info, expectedEventNumber: eventNumber };
  return expectedEvent;
}
