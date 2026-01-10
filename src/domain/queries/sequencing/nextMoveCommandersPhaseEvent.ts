import type {
  Board,
  GameState,
  MoveCommandersPhaseState,
  RoundState,
} from '@entities';
import type { Event } from '@events';
import type { z } from 'zod';
import { eventSchema, moveCommanderEventSchema } from '@events';

export function getExpectedMoveCommandersPhaseEventSchema<TBoard extends Board>(
  gameState: GameState<TBoard> & {
    currentRoundState: RoundState & {
      currentPhaseState: MoveCommandersPhaseState;
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
  const moveCommandersPhaseState = roundState.currentPhaseState;
  switch (moveCommandersPhaseState.step) {
    case 'moveFirstCommander':
      // First commander is the player with initiative
      return moveCommanderEventSchema;
    case 'moveSecondCommander':
      // Second commander is the other player
      return moveCommanderEventSchema;
    case 'complete':
      // TODO: Create a specific phase completion event schema
      // For now, return the general event schema as a placeholder
      return eventSchema;
    default:
      throw new Error(
        `Invalid move commanders phase step: ${roundState.currentPhaseState.step}`,
      );
  }
}
