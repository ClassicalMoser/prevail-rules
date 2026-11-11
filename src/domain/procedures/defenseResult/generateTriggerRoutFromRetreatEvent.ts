import type { TriggerRoutFromRetreatEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE,
} from '@events';
import { findRetreatAwaitingRout, getCurrentPhaseState } from '@queries';

/**
 * Builds the effect that turns a retreat with nowhere to go into a rout
 * (§9.1.6). The event carries nothing: applying it finds the retreat waiting
 * for its rout, as this does.
 *
 * @param state - A retreat with no legal path whose rout has not opened
 * @returns The event
 * @throws Error outside a shot, engagement or melee; or when no retreat is waiting to turn into a rout
 */
export function generateTriggerRoutFromRetreatEvent(
  state: GameState,
): TriggerRoutFromRetreatEvent {
  // A retreat can fall into a rout in a shot, engagement or melee only.
  const phaseState = getCurrentPhaseState(state);
  if (
    phaseState.phase !== 'issueCommands' &&
    phaseState.phase !== 'resolveMelee'
  ) {
    throw new Error(`Retreat rout not expected in phase: ${phaseState.phase}`);
  }

  const location = findRetreatAwaitingRout(state);
  if (location === undefined) {
    throw new Error(
      `No retreat with nowhere to go is waiting for its rout in phase: ${phaseState.phase}`,
    );
  }

  // A front-engaged defender is offered the retreat only when it has one to
  // make (§6.3.2), so a retreat it gave ground to always has a path.
  if (location.source === 'frontEngagement') {
    throw new Error('A front engagement retreat always has a legal path');
  }

  const event: TriggerRoutFromRetreatEvent = {
    effectType: TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
  return event;
}
