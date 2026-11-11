import type { PlayerSide } from '@entities';
import type { ChooseWhetherToRetreatEvent } from '@events';
import type { GameState } from '@game';
import { createChooseWhetherToRetreatEvent } from '@factories';
import {
  findFrontEngagementStateFromMovement,
  getFrontEngagementStage,
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
  if (stage === 'defenderCommitting') {
    throw new Error('The defender has not yet committed');
  }
  if (stage === 'retreatBeingWorkedOut') {
    throw new Error('It is not yet known whether the defender can retreat');
  }
  if (stage === 'noRetreat') {
    throw new Error('The defender has nowhere to retreat to');
  }
  if (stage !== 'defenderDeciding') {
    throw new Error('The defender has already decided whether to retreat');
  }

  return getOtherPlayer(front.engagingUnit.playerSide);
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
  const player = pendingWhetherToRetreatPlayer(gameState);

  return [true, false].map((choosesToRetreat) =>
    createChooseWhetherToRetreatEvent({
      player,
      choosesToRetreat,
    }),
  );
}
