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
  completePlayCardsPhaseEventSchema,
  resolveInitiativeEventSchema,
  revealCardsEventSchema,
} from '@events';

export function getExpectedPlayCardsPhaseEventSchema<TBoard extends Board>(
  gameState: GameState<TBoard> & {
    currentRoundState: RoundState<TBoard> & {
      currentPhaseState: PlayCardsPhaseState;
    };
  },
): z.ZodType<Event<TBoard>> {
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
      return revealCardsEventSchema;
    case 'assignInitiative':
      return resolveInitiativeEventSchema;
    case 'complete':
      return completePlayCardsPhaseEventSchema;
    default:
      throw new Error(
        `Invalid play cards phase step: ${roundState.currentPhaseState.step}`,
      );
  }
}
