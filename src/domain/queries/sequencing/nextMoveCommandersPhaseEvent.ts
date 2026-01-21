import type {
  Board,
  GameState,
  MoveCommandersPhaseState,
  RoundState,
} from '@entities';
import type { Event } from '@events';
import type { z } from 'zod';
import {
  completeMoveCommandersPhaseEventSchema,
  moveCommanderEventSchema,
} from '@events';

export function getExpectedMoveCommandersPhaseEventSchema<TBoard extends Board>(
  gameState: GameState<TBoard> & {
    currentRoundState: RoundState<TBoard> & {
      currentPhaseState: MoveCommandersPhaseState;
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
  const moveCommandersPhaseState = roundState.currentPhaseState;
  switch (moveCommandersPhaseState.step) {
    case 'moveFirstCommander':
      // First commander is the player with initiative
      return moveCommanderEventSchema as z.ZodType<Event<TBoard>>;
    case 'moveSecondCommander':
      // Second commander is the other player
      return moveCommanderEventSchema as z.ZodType<Event<TBoard>>;
    case 'complete':
      return completeMoveCommandersPhaseEventSchema as z.ZodType<Event<TBoard>>;
    default:
      throw new Error(
        `Invalid move commanders phase step: ${roundState.currentPhaseState.step}`,
      );
  }
}
