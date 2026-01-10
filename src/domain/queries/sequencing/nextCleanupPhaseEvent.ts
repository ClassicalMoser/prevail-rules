import type {
  Board,
  CleanupPhaseState,
  GameState,
  RoundState,
} from '@entities';
import type { Event } from '@events';
import type { z } from 'zod';
import {
  chooseRallyEventSchema,
  eventSchema,
  resolveRallyEventSchema,
} from '@events';

export function getExpectedCleanupPhaseEventSchema<TBoard extends Board>(
  gameState: GameState<TBoard> & {
    currentRoundState: RoundState & { currentPhaseState: CleanupPhaseState };
  },
): z.ZodType<Event> {
  const roundState = gameState.currentRoundState;
  if (!roundState) {
    throw new Error('No round state found');
  }
  if (!roundState.currentPhaseState) {
    throw new Error('No current phase state found');
  }
  const cleanupPhaseState = roundState.currentPhaseState;
  switch (cleanupPhaseState.step) {
    case 'discardPlayedCards':
      // TODO: Create a specific discard played cards event schema
      // For now, return the general event schema as a placeholder
      return eventSchema;
    case 'firstPlayerChooseRally':
      // First player is the player with initiative
      return chooseRallyEventSchema;
    case 'firstPlayerResolveRally':
      // First player is the player with initiative
      return resolveRallyEventSchema;
    case 'secondPlayerChooseRally':
      // Second player is the other player
      return chooseRallyEventSchema;
    case 'secondPlayerResolveRally':
      // Second player is the other player
      return resolveRallyEventSchema;
    case 'complete':
      // TODO: Create a specific phase completion event schema
      // For now, return the general event schema as a placeholder
      return eventSchema;
    default:
      throw new Error(
        `Invalid cleanup phase step: ${roundState.currentPhaseState.step}`,
      );
  }
}
