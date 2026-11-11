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
 * Accepts projected opponent `chooseCard` / `commit*` events (`'hidden'` card
 * fields) on seen visibility states so seated clients can fold the wire stream.
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
    newState = applyPlayerChoiceEvent(event, state);
  } else if (event.eventType === 'gameEffect') {
    newState = applyGameEffectEvent(event, state);
  } else {
    // Adding an event kind without routing it fails to compile here.
    const _exhaustive: never = event;
    throw new Error(`Unknown event type: ${(_exhaustive as Event).eventType}`);
  }

  // The event that ends a round belongs to the round it ends (§4.5.4). The
  // log is the cursor for replay and undo, so the new round's log must start
  // empty: its own first event is the first thing the new round asks for. The
  // stream the application stores files this event under the old round too.
  const endsTheRound =
    event.eventType === 'gameEffect' &&
    event.effectType === 'completeCleanupPhase';
  if (endsTheRound) {
    return newState;
  }

  const logged: S = {
    ...newState,
    currentRoundState: {
      ...newState.currentRoundState,
      // Projected wire events may redact card fields; stored for local fold only.
      events: [...newState.currentRoundState.events, event],
    },
  };
  return logged;
}
