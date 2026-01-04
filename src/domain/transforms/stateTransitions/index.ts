/**
 * State transition functions for applying events to game state.
 * Each function is pure and returns a new game state without mutating the input.
 */

import type { Board, GameState } from '@entities';
import type { Event } from '@events';
import { applyMoveUnitEvent } from './applyMoveUnitEvent';

/**
 * Type for a state transition function.
 * Takes an event and current state, returns new state.
 * Preserves the board type through the transition.
 */
export type StateTransition<
  TEvent extends Event,
  TBoard extends Board = Board,
> = (event: TEvent, state: GameState<TBoard>) => GameState<TBoard>;

/**
 * Gets the appropriate state transition function for an event.
 * Returns undefined if no transition is found for the event type.
 */
export function getStateTransition<TBoard extends Board = Board>(
  event: Event,
): StateTransition<Event, TBoard> | undefined {
  // Use type narrowing to determine which transition to use
  if (event.eventType === 'playerChoice') {
    // Handle player choice events
    if ('unit' in event && 'from' in event && 'to' in event) {
      // This is a MoveUnitEvent
      return applyMoveUnitEvent as StateTransition<Event, TBoard>;
    }
    // Add other player choice event transitions here
    // if ('card' in event && 'player' in event) {
    //   return applyChooseCardEvent;
    // }
  } else if (event.eventType === 'gameEffect') {
    // Handle game effect events
    // Add game effect transitions here
    // if ('engagement' in event) {
    //   return applyResolveEngagementEvent;
    // }
  }

  return undefined;
}

/**
 * Applies an event to game state using the appropriate transition function.
 * Throws an error if no transition is found for the event type.
 * Preserves the board type through the transition.
 *
 * @param event - The event to apply
 * @param state - The current game state
 * @returns A new game state with the event applied
 * @throws {Error} If no transition is found for the event type
 */
export function applyEvent<TBoard extends Board>(
  event: Event,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const transition = getStateTransition<TBoard>(event);
  if (!transition) {
    throw new Error(
      `No state transition found for event type: ${JSON.stringify(event)}`,
    );
  }
  return transition(event, state);
}
