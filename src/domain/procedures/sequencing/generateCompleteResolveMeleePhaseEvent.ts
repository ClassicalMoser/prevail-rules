import type { CompleteResolveMeleePhaseEvent } from '@events';
import type { GameState } from '@game';
import {
  COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteResolveMeleePhaseEvent to complete the resolve melee phase
 * and advance to cleanup phase.
 *
 * @param state - The current game state
 * @returns A complete CompleteResolveMeleePhaseEvent
 */
export function generateCompleteResolveMeleePhaseEvent(
  state: GameState,
): CompleteResolveMeleePhaseEvent {
  // Return is independent of state, so we can ignore it
  // TODO(composition): this takes the state only to ignore it, so asked
  // outside Resolve Melee, or with a fight still owed, it still answers,
  // where `DESIGN.md` has a function asked outside its gate throw.
  // `generateCompleteMoveCommandersPhaseEvent` reads its phase to insist on
  // it; `generateCompleteUnitMovementEvent` takes no state at all. Settle by
  // reading the phase through `getResolveMeleePhaseState` and refusing while
  // a melee or a remaining engagement is owed, or by dropping the parameter.
  const _stateUnused = state;

  // Every engagement on the board has been fought, or there were none, and
  // the phase ends at once (§4.4.2, §4.4.4). A fight neither side won stays
  // on the board to be fought next round (§7.2.3); the board holds it, so
  // nothing is recorded. Cleanup follows (§4.5).
  const event: CompleteResolveMeleePhaseEvent = {
    effectType: COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // Phase 4 ends, for the transform to open Cleanup.
  return event;
}
