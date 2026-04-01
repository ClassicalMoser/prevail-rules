import type { Board, BoardCoordinate, UnitPlacement } from '@entities';
import type { ResolveMeleeEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_MELEE_EFFECT_TYPE } from '@events';
import {
  applyAttackValue,
  getCurrentUnitStat,
  getLegalRetreats,
  getMeleeResolutionReadyForAttackCalculation,
  getMeleeSupportValue,
  getPlayerUnitWithPosition,
  modifiersFromCompletedCommitment,
} from '@queries';

/**
 * Generates a ResolveMeleeEvent by calculating attack values for both units
 * and determining the results (routed, reversed, retreated for each).
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
 * @returns A complete ResolveMeleeEvent with location and results for both units
 * @throws Error if not in a valid state for melee resolution
 */
export function generateResolveMeleeEvent<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
): ResolveMeleeEvent<TBoard, 'resolveMelee'> {
  const meleeState = getMeleeResolutionReadyForAttackCalculation(state);
  const meleeCoordinate = meleeState.location;

  const whiteUnit = getPlayerUnitWithPosition(
    state.boardState,
    meleeCoordinate as BoardCoordinate<TBoard>,
    'white',
  );
  const blackUnit = getPlayerUnitWithPosition(
    state.boardState,
    meleeCoordinate as BoardCoordinate<TBoard>,
    'black',
  );

  if (!whiteUnit || !blackUnit) {
    throw new Error('Units not found on board');
  }
  const whiteCommitmentModifiers = modifiersFromCompletedCommitment(
    meleeState.whiteCommitment,
  );

  const whiteAttackValue = getCurrentUnitStat(
    whiteUnit.unit,
    'attack',
    state,
    whiteCommitmentModifiers,
  );

  const whiteSupportValue = getMeleeSupportValue(state.boardState, whiteUnit);

  const totalWhiteAttackValue = whiteAttackValue + whiteSupportValue;

  const blackCommitmentModifiers = modifiersFromCompletedCommitment(
    meleeState.blackCommitment,
  );

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

  let whiteLegalRetreatOptions: Set<UnitPlacement<TBoard>>;
  if (whiteUnitResult.unitRetreated) {
    whiteLegalRetreatOptions = getLegalRetreats(whiteUnit, state);
  } else {
    whiteLegalRetreatOptions = new Set();
  }

  let blackLegalRetreatOptions: Set<UnitPlacement<TBoard>>;
  if (blackUnitResult.unitRetreated) {
    blackLegalRetreatOptions = getLegalRetreats(blackUnit, state);
  } else {
    blackLegalRetreatOptions = new Set();
  }

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_MELEE_EFFECT_TYPE,
    eventNumber,
    location: meleeCoordinate,
    whiteUnitWithPlacement: whiteUnit,
    blackUnitWithPlacement: blackUnit,
    whiteLegalRetreatOptions,
    blackLegalRetreatOptions,
    whiteUnitRouted: whiteUnitResult.unitRouted,
    blackUnitRouted: blackUnitResult.unitRouted,
    whiteUnitRetreated: whiteUnitResult.unitRetreated,
    blackUnitRetreated: blackUnitResult.unitRetreated,
    whiteUnitReversed: whiteUnitResult.unitReversed,
    blackUnitReversed: blackUnitResult.unitReversed,
  };
}
