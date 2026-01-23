/**
 * Pure Transform Engine
 *
 * This is the core transform engine that takes a gamestate and event,
 * and returns a new gamestate (immutable). This is a pure function with
 * no side effects, enabling deterministic playback, reversibility, and
 * reconstructability.
 *
 * The engine routes events to their corresponding state transition functions
 * based on the event's discriminated union type.
 */

import type { Board, GameState } from '@entities';
import type { Event } from '@events';
import { applyGameEffectEvent } from './applyGameEffectEvent';
import { applyPlayerChoiceEvent } from './applyPlayerChoiceEvent';

/**
 * Applies an event to the game state, returning a new immutable game state.
 *
 * This is the pure transform engine - it takes gamestate and event,
 * and returns new gamestate. All state transitions are immutable.
 *
 * @param event - The event to apply
 * @param state - The current game state
 * @returns A new game state with the event applied
 * @throws Error if the event type is not recognized or not yet implemented
 *
 * @example
 * ```typescript
 * const newState = applyEvent(moveUnitEvent, currentState);
 * // newState is a new immutable object, currentState is unchanged
 * ```
 */
export function applyEvent<TBoard extends Board>(
  event: Event<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  // Route based on event type (playerChoice vs gameEffect)
  if (event.eventType === 'playerChoice') {
    return applyPlayerChoiceEvent(event, state);
  } else if (event.eventType === 'gameEffect') {
    return applyGameEffectEvent(event, state);
  } else {
    // This should never happen with proper TypeScript types, but provides runtime safety
    throw new Error(
      `Unknown event type: ${(event as Event<TBoard>).eventType}`,
    );
  }
}
