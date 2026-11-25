import type { PlayerSide } from '@entities';
import type { ChooseWhetherToRetreatEvent } from '@events';
import type { GameState } from '@game';
import { createChooseWhetherToRetreatEvent } from '@factories';
import {
  findFrontEngagementStateFromMovement,
  getFrontEngagementStage,
  getMovementResolutionState,
  getOtherPlayer,
} from '@queries';

/**
 * Defending player when a front engagement is awaiting chooseWhetherToRetreat:
 * commitment done, can retreat, decision still pending.
 *
 * @throws Error when any of those does not hold
 */
function pendingWhetherToRetreatPlayer<S extends GameState>(
  gameState: S,
): PlayerSide {
  // Only a front engagement offers the defender the chance to fall back
  // (§6.3.2).
  const front = findFrontEngagementStateFromMovement(gameState);
  if (front === undefined) {
    throw new Error('No front engagement is being resolved');
  }

  // The defender decides only at its own stage of the engagement.
  const stage = getFrontEngagementStage(front.engagementResolutionState);

  // Its commitment comes first, since a Speed card can make it fast enough
  // to fall back (§6.3.2 step 1).
  if (stage === 'defenderCommitting') {
    throw new Error('The defender has not yet committed');
  }

  // Whether it is faster than the mover and has a way back is worked out
  // before it is asked (§6.3.2 step 2).
  if (stage === 'retreatBeingWorkedOut') {
    throw new Error('It is not yet known whether the defender can retreat');
  }

  // A defender with nowhere to fall back to is not offered the choice; it
  // stays and fights (§6.3.2 step 2).
  if (stage === 'noRetreat') {
    throw new Error('The defender has nowhere to retreat to');
  }

  // Once it has chosen, the choice is not offered again.
  if (stage !== 'defenderDeciding') {
    throw new Error('The defender has already decided whether to retreat');
  }

  // The defender is the other side from the unit that moved into it.
  const mover = getMovementResolutionState(gameState).movingUnit.playerSide;
  const defender = getOtherPlayer(mover);
  return defender;
}

/**
 * Returns the two legal choose-whether-to-retreat events (yes / no) for the
 * front-engagement defender when that decision is pending.
 *
 * Nothing asks unless the defender is deciding, so being asked then is the
 * caller's mistake and throws.
 *
 * @throws Error when no front engagement awaits the defender's decision
 */
export function getLegalChooseWhetherToRetreatEvents<S extends GameState>(
  gameState: S,
): ChooseWhetherToRetreatEvent[] {
  // Only the defender of a front engagement, at its moment to decide.
  const player = pendingWhetherToRetreatPlayer(gameState);

  // It may fall back or stand (§6.3.2 steps 3 and 4); falling back is a
  // "may", so standing is always open (§1.2).
  const choices = [true, false].map((choosesToRetreat) =>
    createChooseWhetherToRetreatEvent({
      player,
      choosesToRetreat,
    }),
  );

  // What `isValidChooseWhetherToRetreatEvent` checks the defender's answer
  // against.
  return choices;
}
