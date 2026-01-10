import type {
  Board,
  CleanupPhaseState,
  GameState,
  IssueCommandsPhaseState,
  MoveCommandersPhaseState,
  PlayCardsPhaseState,
  ResolveMeleePhaseState,
  RoundState,
} from '@entities';
import type { Event } from '@events';
import type { z } from 'zod';
import { getExpectedCleanupPhaseEventSchema } from './nextCleanupPhaseEvent';
import { getExpectedIssueCommandsPhaseEventSchema } from './nextIssueCommandsPhaseEvent';
import { getExpectedMoveCommandersPhaseEventSchema } from './nextMoveCommandersPhaseEvent';
import { getExpectedPlayCardsPhaseEventSchema } from './nextPlayCardPhaseEvent';
import { getExpectedResolveMeleePhaseEventSchema } from './nextResolveMeleePhaseEvent';

/**
 * Get the next event in the sequence.
 * @param gameState - The current game state
 * @returns The next event schema
 */
export function getExpectedEventSchema<TBoard extends Board>(
  gameState: GameState<TBoard>,
): z.ZodType<Event> {
  const roundState = gameState.currentRoundState;
  if (!roundState) {
    throw new Error('No round state found');
  }
  if (!roundState.currentPhaseState) {
    throw new Error('No current phase state found');
  }
  switch (roundState.currentPhaseState.phase) {
    case 'playCards':
      return getExpectedPlayCardsPhaseEventSchema(
        gameState as GameState<TBoard> & {
          currentRoundState: RoundState & {
            currentPhaseState: PlayCardsPhaseState;
          };
        },
      );
    case 'moveCommanders':
      return getExpectedMoveCommandersPhaseEventSchema(
        gameState as GameState<TBoard> & {
          currentRoundState: RoundState & {
            currentPhaseState: MoveCommandersPhaseState;
          };
        },
      );
    case 'issueCommands':
      return getExpectedIssueCommandsPhaseEventSchema(
        gameState as GameState<TBoard> & {
          currentRoundState: RoundState & {
            currentPhaseState: IssueCommandsPhaseState;
          };
        },
      );
    case 'resolveMelee':
      return getExpectedResolveMeleePhaseEventSchema(
        gameState as GameState<TBoard> & {
          currentRoundState: RoundState & {
            currentPhaseState: ResolveMeleePhaseState;
          };
        },
      );
    case 'cleanup':
      return getExpectedCleanupPhaseEventSchema(
        gameState as GameState<TBoard> & {
          currentRoundState: RoundState & {
            currentPhaseState: CleanupPhaseState;
          };
        },
      );
    default:
      throw new Error('Invalid phase');
  }
}
