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

import type { Board } from "@entities";
import type { Event, EventForBoard } from "@events";
import type { GameState, GameStateForBoard } from "@game";
import { applyGameEffectEvent } from "./applyGameEffectEvent";
import { applyPlayerChoiceEvent } from "./applyPlayerChoiceEvent";

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
export function applyEventForBoard<TBoard extends Board>(
  event: EventForBoard<TBoard>,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  let newState: GameStateForBoard<TBoard>;

  if (event.eventType === "playerChoice") {
    newState = applyPlayerChoiceEvent<TBoard>(event, state);
  } else if (event.eventType === "gameEffect") {
    newState = applyGameEffectEvent<TBoard>(event, state);
  } else {
    throw new Error(`Unknown event type: ${(event as EventForBoard<TBoard>).eventType}`);
  }

  // Return the new state with the event added to the events array
  return {
    ...newState,
    currentRoundState: {
      ...newState.currentRoundState,
      events: [...newState.currentRoundState.events, event],
    },
  };
}

/**
 * Wider version of applyEventForBoard that does not require a type argument.
 *
 * @warning This function assumes the following:
 * 1. Any event that carries board information specifies the board type on a `boardType` property.
 * 2. The game state also carries the board type on a `boardType` property.
 *
 * Note that events that do not specify their board type are always assumed safe and are not checked.
 * The conditions above MUST be satisfied for this function to be safe.
 */
export function applyEvent(event: Event, state: GameState): GameState {
  const gameStateBoardType = state.boardType;
  const eventHasBoardType = "boardType" in event;
  if (eventHasBoardType && event.boardType !== gameStateBoardType) {
    throw new Error(
      `Event board type mismatch: Expected ${gameStateBoardType}, got ${event.boardType}`,
    );
  }
  const newState = applyEventForBoard(event as EventForBoard<Board>, state);
  // IMPORTANT: Cast is significant, see warning above.
  return newState as GameState;
}
