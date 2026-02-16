import type {
  Board,
  CompletedCommitment,
  GameState,
  Modifier,
  UnitPlacement,
} from '@entities';
import type { ResolveMeleeEvent } from '@events';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_MELEE_EFFECT_TYPE } from '@events';
import {
  applyAttackValue,
  getCurrentUnitStat,
  getLegalRetreats,
  getMeleeSupportValue,
  getPlayerUnitWithPosition,
} from '@queries';

/**
 * Generates a ResolveMeleeEvent by calculating attack values for both units
 * and determining the results (routed, reversed, retreated for each).
 * Also includes unit positions and legal retreat options in the event.
 *
 * Melee is bidirectional - both units attack each other simultaneously.
 *
 * Attack value calculation for each unit:
 * - Base attack stat
 * - + Melee support bonuses (from adjacent friendly units)
 * - + Card modifiers (from committed cards)
 * - + Active card modifiers (if unit was commanded)
 * - + Round effect modifiers (if applicable)
 *
 * @param state - The current game state
 * @returns A complete ResolveMeleeEvent with location, units, results, and retreat options
 * @throws Error if not in a valid state for melee resolution
 */
export function generateResolveMeleeEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ResolveMeleeEvent<TBoard, 'resolveMelee'> {
  const phaseState = state.currentRoundState.currentPhaseState;

  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  if (phaseState.phase !== 'resolveMelee') {
    throw new Error('Current phase is not resolveMelee');
  }

  if (!phaseState.currentMeleeResolutionState) {
    throw new Error('No current melee resolution state');
  }

  const meleeState = phaseState.currentMeleeResolutionState;

  // Both commitments must be resolved before calculating attacks
  if (meleeState.whiteCommitment.commitmentType === 'pending') {
    throw new Error('White commitment is still pending');
  }

  if (meleeState.blackCommitment.commitmentType === 'pending') {
    throw new Error('Black commitment is still pending');
  }

  // Attack apply states should not exist yet (this procedure creates them)
  if (meleeState.whiteAttackApplyState || meleeState.blackAttackApplyState) {
    throw new Error('Attack apply states already exist');
  }

  const meleeCoordinate = meleeState.location;

  const whiteUnit = getPlayerUnitWithPosition(
    state.boardState,
    meleeCoordinate,
    'white',
  );
  const blackUnit = getPlayerUnitWithPosition(
    state.boardState,
    meleeCoordinate,
    'black',
  );

  if (!whiteUnit || !blackUnit) {
    throw new Error('Units not found on board');
  }
  // Calculate the total current attack value for the white unit
  const whiteCommitment: CompletedCommitment | undefined =
    meleeState.whiteCommitment.commitmentType === 'completed'
      ? meleeState.whiteCommitment
      : undefined;
  const whiteCommitmentModifiers: Modifier[] | undefined = whiteCommitment
    ? whiteCommitment.card.modifiers
    : undefined;

  const whiteAttackValue = getCurrentUnitStat(
    whiteUnit.unit,
    'attack',
    state,
    whiteCommitmentModifiers,
  );

  const whiteSupportValue = getMeleeSupportValue(state.boardState, whiteUnit);

  const totalWhiteAttackValue = whiteAttackValue + whiteSupportValue;

  const blackCommitment: CompletedCommitment | undefined =
    meleeState.blackCommitment.commitmentType === 'completed'
      ? meleeState.blackCommitment
      : undefined;
  const blackCommitmentModifiers: Modifier[] | undefined = blackCommitment
    ? blackCommitment.card.modifiers
    : undefined;

  const blackAttackValue = getCurrentUnitStat(
    blackUnit.unit,
    'attack',
    state,
    blackCommitmentModifiers,
  );

  const blackSupportValue = getMeleeSupportValue(state.boardState, blackUnit);

  const totalBlackAttackValue = blackAttackValue + blackSupportValue;

  // Apply attack values to determine results
  // White unit attacks black unit
  const blackUnitResult = applyAttackValue(
    state,
    totalWhiteAttackValue,
    blackUnit.unit,
  );

  // Black unit attacks white unit
  const whiteUnitResult = applyAttackValue(
    state,
    totalBlackAttackValue,
    whiteUnit.unit,
  );

  // Compute legal retreats for units that are retreating
  const whiteLegalRetreats: Set<UnitPlacement<Board>> =
    whiteUnitResult.unitRetreated
      ? (getLegalRetreats(whiteUnit, state) as Set<UnitPlacement<Board>>)
      : new Set();
  const blackLegalRetreats: Set<UnitPlacement<Board>> =
    blackUnitResult.unitRetreated
      ? (getLegalRetreats(blackUnit, state) as Set<UnitPlacement<Board>>)
      : new Set();

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_MELEE_EFFECT_TYPE,
    location: meleeCoordinate,
    whiteUnit,
    blackUnit,
    whiteUnitRouted: whiteUnitResult.unitRouted,
    blackUnitRouted: blackUnitResult.unitRouted,
    whiteUnitRetreated: whiteUnitResult.unitRetreated,
    blackUnitRetreated: blackUnitResult.unitRetreated,
    whiteUnitReversed: whiteUnitResult.unitReversed,
    blackUnitReversed: blackUnitResult.unitReversed,
    whiteLegalRetreats,
    blackLegalRetreats,
  };
}
