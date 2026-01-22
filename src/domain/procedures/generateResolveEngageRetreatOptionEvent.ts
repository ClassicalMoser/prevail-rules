import type {
  Board,
  CompletedCommitment,
  GameState,
  Modifier,
} from '@entities';
import type { ResolveEngageRetreatOptionEvent } from '@events';
import { hasSingleUnit } from '@entities';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
} from '@events';
import { getBoardSpace, getCurrentUnitStat } from '@queries';

/**
 * Generates a ResolveEngageRetreatOptionEvent by determining if the defending unit
 * can retreat during a front engagement.
 *
 * @param state - The current game state
 * @returns A complete ResolveEngageRetreatOptionEvent. Retreat is possible if the defending
 * unit has a higher current speed value than the engaging unit.
 * @throws Error if not in issueCommands phase, no movement resolution, or no engagement state
 */
export function generateResolveEngageRetreatOptionEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ResolveEngageRetreatOptionEvent<TBoard, 'resolveEngageRetreatOption'> {
  const phaseState = state.currentRoundState.currentPhaseState;

  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  if (phaseState.phase !== 'issueCommands') {
    throw new Error('Current phase is not issueCommands');
  }

  if (!phaseState.currentCommandResolutionState) {
    throw new Error('No current command resolution state');
  }

  if (
    phaseState.currentCommandResolutionState.commandResolutionType !==
    'movement'
  ) {
    throw new Error('Current command resolution is not a movement');
  }

  const movementResolutionState = phaseState.currentCommandResolutionState;
  const engagementState = movementResolutionState.engagementState;

  if (!engagementState) {
    throw new Error('No engagement state found');
  }

  if (!engagementState.engagementResolutionState) {
    throw new Error('No engagement resolution state found');
  }

  if (engagementState.engagementResolutionState.engagementType !== 'front') {
    throw new Error('Engagement type is not front');
  }

  // Get the defending unit from the board
  const board = state.boardState;
  const targetSpace = getBoardSpace(
    board,
    engagementState.targetPlacement.coordinate,
  );

  if (!hasSingleUnit(targetSpace.unitPresence)) {
    throw new Error('Defending space does not have a single unit');
  }

  const defendingUnit = targetSpace.unitPresence.unit;
  const engagingUnit = engagementState.engagingUnit;

  const engagingCommitment: CompletedCommitment | undefined =
    movementResolutionState.commitment.commitmentType === 'completed'
      ? movementResolutionState.commitment
      : undefined;
  const engagingCommitmentModifiers: Modifier[] | undefined = engagingCommitment
    ? engagingCommitment.card.modifiers
    : undefined;

  const defendingCommitment: CompletedCommitment | undefined =
    movementResolutionState.commitment.commitmentType === 'completed'
      ? movementResolutionState.commitment
      : undefined;
  const defendingCommitmentModifiers: Modifier[] | undefined =
    defendingCommitment ? defendingCommitment.card.modifiers : undefined;

  // Get current speed values for both units
  const defendingSpeed = getCurrentUnitStat(
    defendingUnit,
    'speed',
    state,
    defendingCommitmentModifiers,
  );

  const engagingSpeed = getCurrentUnitStat(
    engagingUnit,
    'speed',
    state,
    engagingCommitmentModifiers,
  );

  // Retreat is possible if defending unit has higher speed than engaging unit
  const defendingUnitCanRetreat = defendingSpeed > engagingSpeed;

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
    defendingUnitCanRetreat,
  };
}
