import type { PlayerSide } from '@entities';
import type { ChooseWhetherToRetreatEvent } from '@events';
import type { GameState } from '@game';
import { createChooseWhetherToRetreatEvent } from '@factories';
import { getOtherPlayer, findFrontEngagementStateFromMovement } from '@queries';

/**
 * Defending player when a front engagement is awaiting chooseWhetherToRetreat:
 * commitment done, can retreat, decision still pending.
 */
function pendingWhetherToRetreatPlayer<S extends GameState>(
  gameState: S,
): PlayerSide | null {
  // Only a front engagement offers the defender the chance to fall back
  // (§6.3.2).
  const front = findFrontEngagementStateFromMovement(gameState);
  if (front === undefined) {
    return null;
  }

  const engagement = front.engagementResolutionState;
  if (engagement.defensiveCommitment.commitmentType === 'pending') {
    return null;
  }
  if (engagement.defendingUnitCanRetreat !== true) {
    return null;
  }
  if (engagement.defendingUnitRetreats !== 'pending') {
    return null;
  }

  return getOtherPlayer(front.engagingUnit.playerSide);
}

/**
 * Returns the two legal choose-whether-to-retreat events (yes / no) for the
 * front-engagement defender when that decision is pending.
 *
 * Returns `[]` when the choice is not expected.
 */
export function getLegalChooseWhetherToRetreatEvents<S extends GameState>(
  gameState: S,
): ChooseWhetherToRetreatEvent[] {
  const player = pendingWhetherToRetreatPlayer(gameState);
  if (player === null) {
    return [];
  }

  return [true, false].map((choosesToRetreat) =>
    createChooseWhetherToRetreatEvent({
      player,
      choosesToRetreat,
    }),
  );
}
