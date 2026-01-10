import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  RoundState,
} from '@entities';
import type { Event } from '@events';
import type { z } from 'zod';
import { eventSchema, issueCommandEventSchema } from '@events';

export function getExpectedIssueCommandsPhaseEventSchema<TBoard extends Board>(
  gameState: GameState<TBoard> & {
    currentRoundState: RoundState & {
      currentPhaseState: IssueCommandsPhaseState;
    };
  },
): z.ZodType<Event> {
  const roundState = gameState.currentRoundState;
  if (!roundState) {
    throw new Error('No round state found');
  }
  if (!roundState.currentPhaseState) {
    throw new Error('No current phase state found');
  }
  const issueCommandsPhaseState = roundState.currentPhaseState;
  switch (issueCommandsPhaseState.step) {
    case 'firstPlayerIssueCommands':
      // First player is the player with initiative
      return issueCommandEventSchema;
    case 'firstPlayerResolveCommands':
      // TODO: Create a specific resolve commands event schema
      // For now, return the general event schema as a placeholder
      return eventSchema;
    case 'secondPlayerIssueCommands':
      // Second player is the other player
      return issueCommandEventSchema;
    case 'secondPlayerResolveCommands':
      // TODO: Create a specific resolve commands event schema
      // For now, return the general event schema as a placeholder
      return eventSchema;
    case 'complete':
      // TODO: Create a specific phase completion event schema
      // For now, return the general event schema as a placeholder
      return eventSchema;
    default:
      throw new Error(
        `Invalid issue commands phase step: ${roundState.currentPhaseState.step}`,
      );
  }
}
