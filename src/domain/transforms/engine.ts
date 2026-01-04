/**
 * Rules engine for executing game events and managing state transitions.
 * This is a runtime-agnostic, pure function-based rules engine.
 */

import type { Board, GameState } from '@entities';
import type { Event } from '@events';
import { isLegalMove } from '@validation';
import { applyEvent } from './stateTransitions';

/**
 * Result of executing an event through the rules engine.
 */
export interface RuleExecutionResult<TBoard extends Board = Board> {
  /** Whether the event was successfully executed */
  success: boolean;
  /** The new game state after applying the event */
  newState: GameState<TBoard>;
  /** Events that were triggered by this event (e.g., engagement from move) */
  triggeredEvents: Event[];
  /** Any errors that occurred during execution */
  errors: string[];
}

/**
 * Rules engine for executing game events.
 * This engine:
 * - Validates events before applying them
 * - Applies state transitions
 * - Handles triggered events
 * - Returns results without side effects
 */
export class RulesEngine {
  /**
   * Execute an event against the current game state.
   * This is a pure function - no side effects.
   * Preserves the board type through execution.
   *
   * @param event - The event to execute
   * @param state - The current game state
   * @returns The result of executing the event
   */
  execute<TBoard extends Board>(
    event: Event,
    state: GameState<TBoard>,
  ): RuleExecutionResult<TBoard> {
    const errors: string[] = [];
    const triggeredEvents: Event[] = [];

    // Step 1: Validate the event
    const validationResult = this.validateEvent(event, state);
    if (!validationResult.valid) {
      return {
        success: false,
        newState: state,
        triggeredEvents: [],
        errors: [...errors, ...validationResult.errors],
      };
    }

    // Step 2: Apply state transition
    let newState: GameState<TBoard>;
    try {
      newState = applyEvent(event, state);
    } catch (error) {
      return {
        success: false,
        newState: state,
        triggeredEvents: [],
        errors: [
          ...errors,
          error instanceof Error ? error.message : 'Unknown error',
        ],
      };
    }

    return {
      success: true,
      newState,
      triggeredEvents,
      errors: [],
    };
  }

  /**
   * Execute multiple events in sequence.
   * Each event is applied to the state resulting from the previous event.
   * Preserves the board type through execution.
   *
   * @param events - The events to execute in order
   * @param initialState - The initial game state
   * @returns The result of executing all events
   */
  executeSequence<TBoard extends Board>(
    events: Event[],
    initialState: GameState<TBoard>,
  ): RuleExecutionResult<TBoard> {
    let currentState = initialState;
    const allTriggeredEvents: Event[] = [];
    const allErrors: string[] = [];

    for (const event of events) {
      const result = this.execute(event, currentState);

      if (!result.success) {
        return {
          success: false,
          newState: currentState,
          triggeredEvents: allTriggeredEvents,
          errors: [...allErrors, ...result.errors],
        };
      }

      currentState = result.newState;
      allTriggeredEvents.push(...result.triggeredEvents);
      allErrors.push(...result.errors);
    }

    return {
      success: true,
      newState: currentState,
      triggeredEvents: allTriggeredEvents,
      errors: allErrors,
    };
  }

  /**
   * Validates an event against the current game state.
   * Returns validation result with any errors.
   */
  private validateEvent<TBoard extends Board>(
    event: Event,
    state: GameState<TBoard>,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate based on event type
    if (event.eventType === 'playerChoice') {
      if ('unit' in event && 'from' in event && 'to' in event) {
        // This is a MoveUnitEvent
        const moveEvent = event as Extract<
          Event,
          { unit: unknown; from: unknown; to: unknown }
        >;
        if (!isLegalMove<TBoard>(moveEvent as any, state)) {
          errors.push('Move is not legal according to game rules');
        }
      }
      // Add other player choice validations here
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
