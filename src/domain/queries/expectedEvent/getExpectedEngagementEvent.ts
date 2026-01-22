import type {
  Board,
  EngagementState,
  ExpectedEventInfo,
  GameState,
} from '@entities';
import { hasEngagedUnits, hasNoUnit } from '@entities';
import { getBoardSpace } from '@queries/boardSpace';
import { getOtherPlayer } from '@queries/getOtherPlayer';
import { isFriendlyUnit } from '@queries/unit';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * Gets the expected event for engagement resolution substeps.
 * This is a composable function that can be used in any context where
 * engagement state appears (movement resolution, etc.).
 *
 * @param gameState - The game state, needed to read what's happening on the board
 * @param engagementState - The engagement state, relevant to this engagement resolution
 * Prevents having to scan through phases to find the engagement state
 * @returns Information about what event is expected
 */
export function getExpectedEngagementEvent<TBoard extends Board>(
  gameState: GameState<TBoard>,
  engagementState: EngagementState<TBoard>,
): ExpectedEventInfo<TBoard> {
  const attackingPlayer = engagementState.engagingUnit.playerSide;
  const defendingPlayer = getOtherPlayer(attackingPlayer);
  const board = gameState.boardState;
  const spaceState = getBoardSpace(
    board,
    engagementState.targetPlacement.coordinate,
  );
  // Basic defensive checks to ensure we're not in an invalid state
  const defendingUnitPresence = spaceState.unitPresence;
  if (hasNoUnit(defendingUnitPresence)) {
    throw new Error('nothing to engage');
  }
  if (hasEngagedUnits(defendingUnitPresence)) {
    throw new Error('defending unit is already engaged');
  }
  const defendingUnit = defendingUnitPresence.unit;
  if (isFriendlyUnit(defendingUnit, defendingPlayer)) {
    throw new Error('defending unit is friendly');
  }

  // First we check if the engagement type has been determined yet
  if (engagementState.engagementResolutionState === undefined) {
    // If not, that is what we expect next
    return {
      actionType: 'gameEffect',
      effectType: 'resolveEngagementType',
    };
  }
  // If it is, it determines what the next event should be
  const resolutionState = engagementState.engagementResolutionState;
  const engagementType = resolutionState.engagementType;
  if (engagementType === 'flank') {
    // If the engagement is from the flank, we need to rotate the defending unit
    if (!resolutionState.defenderRotated) {
      // If the defending unit has not been rotated yet, we need to rotate it
      return {
        actionType: 'gameEffect',
        effectType: 'resolveFlankEngagement',
      };
    }
    throw new Error('Engagement resolution is complete');
  }
  if (engagementType === 'rear') {
    // If the engagement is from the rear, we need to rout the defending unit
    return getExpectedRoutEvent(resolutionState.routState);
  }
  if (engagementType === 'front') {
    // If the engagement is from the front,
    // we need to check if the defensive commitment has been resolved
    if (resolutionState.defensiveCommitment.commitmentType === 'pending') {
      return {
        actionType: 'playerChoice',
        playerSource: defendingPlayer,
        choiceType: 'commitToMovement',
      };
    }
    // If the defensive commitment has been resolved,
    // we need to check if the defending unit can retreat
    if (resolutionState.defendingUnitCanRetreat === undefined) {
      return {
        actionType: 'gameEffect',
        effectType: 'resolveEngageRetreatOption',
      };
    }
    if (resolutionState.defendingUnitCanRetreat === false) {
      throw new Error('Defending unit cannot retreat');
    }
    // If the defending unit can retreat, we need to check if it has chosen to retreat
    if (resolutionState.defendingUnitRetreats === undefined) {
      return {
        actionType: 'playerChoice',
        playerSource: defendingPlayer,
        choiceType: 'chooseWhetherToRetreat',
      };
    }
    if (resolutionState.defendingUnitRetreats === false) {
      throw new Error('Front engagement resolution is complete');
    }
    if (resolutionState.defendingUnitRetreated === undefined) {
      return {
        actionType: 'playerChoice',
        playerSource: defendingPlayer,
        choiceType: 'chooseRetreatOption',
      };
    }
    throw new Error('Front engagement resolution is complete');
  }
  throw new Error('Invalid engagement type');
}
