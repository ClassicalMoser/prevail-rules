import type {
  Board,
  GameState,
  ResolveMeleePhaseState,
  RoundState,
} from '@entities';
import type { Event } from '@events';
import type { z } from 'zod';
import { chooseMeleeResolutionEventSchema, eventSchema } from '@events';

export function getExpectedResolveMeleePhaseEventSchema<TBoard extends Board>(
  gameState: GameState<TBoard> & {
    currentRoundState: RoundState & {
      currentPhaseState: ResolveMeleePhaseState;
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
  const resolveMeleePhaseState = roundState.currentPhaseState;
  switch (resolveMeleePhaseState.step) {
    case 'resolveMelee':
      // Player chooses which melee to resolve
      return chooseMeleeResolutionEventSchema;
    case 'complete':
      // TODO: Create a specific phase completion event schema
      // For now, return the general event schema as a placeholder
      return eventSchema;
    default:
      throw new Error(
        `Invalid resolve melee phase step: ${roundState.currentPhaseState.step}`,
      );
  }
}
