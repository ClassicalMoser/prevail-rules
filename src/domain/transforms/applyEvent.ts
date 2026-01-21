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
import type { Event, GameEffectEvent, PlayerChoiceEvent } from '@events';
import {
  applyChooseCardEvent,
  applyChooseMeleeEvent,
  applyChooseRallyEvent,
  applyChooseRoutDiscardEvent,
  applyCompleteCleanupPhaseEvent,
  applyCompleteIssueCommandsPhaseEvent,
  applyCompleteMoveCommandersPhaseEvent,
  applyCompletePlayCardsPhaseEvent,
  applyCompleteResolveMeleePhaseEvent,
  applyDiscardPlayedCardsEvent,
  applyMoveCommanderEvent,
  applyMoveUnitEvent,
  applyResolveInitiativeEvent,
  applyResolveRallyEvent,
  applyResolveRoutDiscardEvent,
  applyResolveUnitsBrokenEvent,
  applyRevealCardsEvent,
  applySetupUnitsEvent,
} from './stateTransitions';

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

/**
 * Routes player choice events to their corresponding apply functions.
 */
function applyPlayerChoiceEvent<TBoard extends Board>(
  event: PlayerChoiceEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  switch (event.choiceType) {
    case 'chooseCard':
      return applyChooseCardEvent(event, state);
    case 'chooseMeleeResolution':
      return applyChooseMeleeEvent(event, state);
    case 'chooseRally':
      return applyChooseRallyEvent(event, state);
    case 'chooseRoutDiscard':
      return applyChooseRoutDiscardEvent(event, state);
    case 'moveCommander':
      return applyMoveCommanderEvent(event, state);
    case 'moveUnit':
      return applyMoveUnitEvent(event, state);
    case 'setupUnits':
      return applySetupUnitsEvent(event, state);
    case 'commitToMelee':
    case 'commitToMovement':
    case 'commitToRangedAttack':
    case 'issueCommand':
    case 'performRangedAttack':
      throw new Error(
        `Event type ${event.choiceType} is not yet implemented in the transform engine`,
      );
    default: {
      // Exhaustiveness check for TypeScript
      const _exhaustive: never = event;
      throw new Error(
        `Unknown player choice event type: ${(_exhaustive as PlayerChoiceEvent<TBoard>).choiceType}`,
      );
    }
  }
}

/**
 * Routes game effect events to their corresponding apply functions.
 */
function applyGameEffectEvent<TBoard extends Board>(
  event: GameEffectEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  switch (event.effectType) {
    case 'completeCleanupPhase':
      return applyCompleteCleanupPhaseEvent(event, state);
    case 'completeIssueCommandsPhase':
      return applyCompleteIssueCommandsPhaseEvent(event, state);
    case 'completeMoveCommandersPhase':
      return applyCompleteMoveCommandersPhaseEvent(event, state);
    case 'completePlayCardsPhase':
      return applyCompletePlayCardsPhaseEvent(event, state);
    case 'completeResolveMeleePhase':
      return applyCompleteResolveMeleePhaseEvent(event, state);
    case 'discardPlayedCards':
      return applyDiscardPlayedCardsEvent(event, state);
    case 'resolveInitiative':
      return applyResolveInitiativeEvent(event, state);
    case 'resolveRally':
      return applyResolveRallyEvent(event, state);
    case 'resolveRoutDiscard':
      return applyResolveRoutDiscardEvent(event, state);
    case 'resolveUnitsBroken':
      return applyResolveUnitsBrokenEvent(event, state);
    case 'revealCards':
      return applyRevealCardsEvent(event, state);
    case 'resolveEngagement':
    case 'resolveMelee':
    case 'resolveRangedAttack':
    case 'resolveRetreat':
    case 'resolveReverse':
    case 'resolveRout':
      throw new Error(
        `Event type ${event.effectType} is not yet implemented in the transform engine`,
      );
    default: {
      // Exhaustiveness check for TypeScript
      const _exhaustive: never = event;
      throw new Error(
        `Unknown game effect event type: ${(_exhaustive as GameEffectEvent<TBoard>).effectType}`,
      );
    }
  }
}
