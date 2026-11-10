import type { TriggerRoutFromRetreatEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  MELEE_ATTACK_RESOLUTION_CONTEXT,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
  TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE,
} from '@events';
import { findRetreatAwaitingRout, getCurrentPhaseState } from '@queries';

/**
 * Builds the effect that turns a retreat with nowhere to go into a rout
 * (§9.1.6). The event names the attack the retreat sits under, and in a melee
 * whose unit it is, so applying it writes the rout to that retreat without
 * searching again.
 *
 * @param state - A retreat with no legal path whose rout has not opened
 * @param eventNumber - The ordered index of this event in the round
 * @returns The event, naming where the retreat is held
 * @throws Error outside a shot, engagement or melee; or when no retreat is waiting to turn into a rout
 */
export function generateTriggerRoutFromRetreatEvent(
  state: GameState,
  eventNumber: number,
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

  if (location.source === 'rangedAttack') {
    const ranged: TriggerRoutFromRetreatEvent = {
      effectType: TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE,
      eventNumber,
      eventType: GAME_EFFECT_EVENT_TYPE,
      retreatResolutionContext: RANGED_ATTACK_RESOLUTION_CONTEXT,
    };
    return ranged;
  }

  if (location.source === 'melee') {
    // Both units in a melee may be retreating; the event names whose
    // retreat this is.
    const melee: TriggerRoutFromRetreatEvent = {
      effectType: TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE,
      eventNumber,
      eventType: GAME_EFFECT_EVENT_TYPE,
      retreatResolutionContext: MELEE_ATTACK_RESOLUTION_CONTEXT,
      retreatingPlayer: location.retreatState.retreatingUnit.unit.playerSide,
    };
    return melee;
  }

  // A front-engaged defender is offered the retreat only when it has one to
  // make (§6.3.2), so a retreat it gave ground to always has a path.
  throw new Error('A front engagement retreat always has a legal path');
}
