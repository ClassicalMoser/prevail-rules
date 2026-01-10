import type {
  Board,
  GameState,
  PlayCardsPhaseState,
  RoundState,
} from '@entities';
import type { Event } from '@events';
import type { z } from 'zod';
import {
  chooseCardEventSchema,
  eventSchema,
  resolveInitiativeEventSchema,
} from '@events';

export function getExpectedPlayCardsPhaseEventSchema<TBoard extends Board>(
  gameState: GameState<TBoard> & {
    currentRoundState: RoundState & { currentPhaseState: PlayCardsPhaseState };
  },
): z.ZodType<Event> {
  const roundState = gameState.currentRoundState;
  if (!roundState) {
    throw new Error('No round state found');
  }
  if (!roundState.currentPhaseState) {
    throw new Error('No current phase state found');
  }
  const playCardsPhaseState = roundState.currentPhaseState;
  switch (playCardsPhaseState.step) {
    case 'chooseCards':
      return chooseCardEventSchema;
    case 'revealCards':
      // TODO: Create a specific reveal cards event schema
      // For now, return the general event schema as a placeholder
      return eventSchema;
    case 'assignInitiative':
      return resolveInitiativeEventSchema;
    case 'complete':
      // TODO: Create a specific phase completion event schema
      // For now, return the general event schema as a placeholder
      return eventSchema;
    default:
      throw new Error(
        `Invalid play cards phase step: ${roundState.currentPhaseState.step}`,
      );
  }
}
