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

import type {
  Event,
  GameEffectEvent,
  PlayerChoiceEvent,
  ProjectedPlayerChoiceEvent,
} from '@events';
import type { GameState } from '@game';
import { applyGameEffectEvent } from './applyGameEffectEvent';
import { applyPlayerChoiceEvent } from './applyPlayerChoiceEvent';

/**
 * Applies an event to the game state, returning a new immutable game state.
 *
 * This is the pure transform engine - it takes gamestate and event,
 * and returns new gamestate. All state transitions are immutable.
 *
 * Accepts a projected opponent `chooseCard` event (a `'hidden'` card) on seen
 * visibility states so seated clients can fold the wire stream. A commitment
 * is face up, so it is never projected.
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
export function applyEvent<S extends GameState>(
  event: GameEffectEvent | PlayerChoiceEvent | ProjectedPlayerChoiceEvent,
  state: S,
): S {
  let newState: S;

  if (event.eventType === 'playerChoice') {
    // A choice a player made: validation has already accepted it, or it is a
    // seat's view of the opponent's face-down card (§4.1.1), and the rule for
    // that kind of choice carries it out.
    newState = applyPlayerChoiceEvent(event, state);
  } else if (event.eventType === 'gameEffect') {
    // An effect the game owed: a procedure built it from this same state, and
    // the rule for that kind of effect carries it out.
    newState = applyGameEffectEvent(event, state);
  } else {
    // Adding an event kind without routing it fails to compile here.
    const _exhaustive: never = event;

    // Only an event forged past its type reaches here; the refusal names the
    // kind it claimed, so the fault can be traced to whoever wrote it.
    throw new Error(`Unknown event type: ${(_exhaustive as Event).eventType}`);
  }

  // The next state, with the event's rule carried out; the state passed in
  // is untouched, so the stream can be replayed from any point.
  return newState;
}
