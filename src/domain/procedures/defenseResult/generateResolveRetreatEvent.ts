import type { ResolveRetreatEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_RETREAT_EFFECT_TYPE } from '@events';
import { findRetreatAwaitingMove, getCurrentPhaseState } from '@queries';
import { throwIfPending, throwIfUndefined } from '@utils';

/**
 * Carries out a retreat already decided (§9.1): the path it takes was the
 * only legal one, taken at once, or the one its owner chose among the
 * smallest (§9.1.3). The event names where the unit starts and the path;
 * where it lands follows from those, so it is not recorded twice.
 *
 * Every retreat, whatever opened it, ends here, and this event moves the
 * unit on the board.
 *
 * @param state - The current game state
 * @returns The retreat to carry out: the unit where it stands, and its path
 * @throws Error outside a shot, engagement or melee; or when no retreat has its path settled and its move still to make
 */
export function generateResolveRetreatEvent(
  state: GameState,
): ResolveRetreatEvent {
  // Retreats are carried out in a shot or engagement (issueCommands) and in
  // a melee (resolveMelee), and nowhere else.
  const phaseState = getCurrentPhaseState(state);
  if (
    phaseState.phase !== 'issueCommands' &&
    phaseState.phase !== 'resolveMelee'
  ) {
    throw new Error(
      `Retreat resolution not expected in phase: ${phaseState.phase}`,
    );
  }

  // The retreat to carry out next: the one whose way back is settled and
  // whose unit has not yet taken it. In a melee the second player's unit falls
  // back first, since the first player's blow lands first (§7.5.6).
  const awaitingMove = findRetreatAwaitingMove(state);

  // None settled means the owner has still to choose among equally small
  // retreats (§9.1.3), or nobody is retreating at all, so the effect is not
  // owed.
  const noRetreatSettled =
    phaseState.phase === 'resolveMelee'
      ? 'No chosen retreat found in melee resolution'
      : 'No retreat has been chosen yet';
  const location = throwIfUndefined(awaitingMove, noRetreatSettled);
  const retreatState = location.retreatState;

  // The retreat to carry out was chosen, or was the only one. The selection
  // answers only with a settled path; this says so to the type as well.
  // Nothing reaches the throw: `findRetreatAwaitingMove` passes over a
  // retreat whose path is still pending.
  const path = throwIfPending(
    retreatState.chosenRetreatPath,
    'No retreat has been chosen yet',
  );

  // The unit is named by the retreat's own copy of it, and the path is all
  // the apply needs to find where it lands; a commander standing with it
  // goes along (§9.1.8).
  const gameEffectEvent: ResolveRetreatEvent = {
    effectType: RESOLVE_RETREAT_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    path,
    unit: retreatState.retreatingUnit,
  };

  // The retreat to carry out: this unit falls back along this path.
  return gameEffectEvent;
}
