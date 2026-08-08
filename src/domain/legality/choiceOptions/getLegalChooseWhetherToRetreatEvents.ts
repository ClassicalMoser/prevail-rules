import type { PlayerSide } from '@entities';
import type { ChooseWhetherToRetreatEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import type { GameState } from '@game';
import { getNextEventNumber, getOtherPlayer } from '@queries';

/**
 * Defending player when a front engagement is awaiting chooseWhetherToRetreat:
 * commitment done, can retreat, decision still pending.
 */
function pendingWhetherToRetreatPlayer<S extends GameState>(
  gameState: S,
): PlayerSide | null {
  const phaseState = gameState.currentRoundState.currentPhaseState;
  if (
    phaseState === 'none' ||
    phaseState.phase !== 'issueCommands' ||
    phaseState.currentCommandResolutionState === 'pending'
  ) {
    return null;
  }

  const crs = phaseState.currentCommandResolutionState;
  if (crs.commandResolutionType !== 'movement') {
    return null;
  }
  if (crs.engagementState === 'pending') {
    return null;
  }

  const engagement = crs.engagementState.engagementResolutionState;
  if (engagement.engagementType !== 'front') {
    return null;
  }
  if (engagement.defensiveCommitment.commitmentType === 'pending') {
    return null;
  }
  if (engagement.defendingUnitCanRetreat !== true) {
    return null;
  }
  if (engagement.defendingUnitRetreats !== 'pending') {
    return null;
  }

  return getOtherPlayer(crs.engagementState.engagingUnit.playerSide);
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

  const eventNumber = getNextEventNumber(gameState);
  return [true, false].map((choosesToRetreat) => ({
    choiceType: 'chooseWhetherToRetreat',
    choosesToRetreat,
    eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player,
  }));
}
