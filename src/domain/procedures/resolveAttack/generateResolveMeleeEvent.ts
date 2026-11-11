import type { ResolveMeleeEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_MELEE_EFFECT_TYPE } from '@events';
import {
  applyAttackValue,
  getMeleeResolutionReadyForAttackCalculation,
  getMeleeSupportValue,
  getPlayerUnitWithPosition,
  getRawUnitStat,
  hasInitiative,
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
 * - + CommandCard modifiers (from committed cards)
 * - + Active card modifiers (if unit was commanded)
 * - + Round effect modifiers (if applicable)
 *
 * @param state - The current game state
 * @returns A complete ResolveMeleeEvent with location and results for both units
 * @throws Error if not in a valid state for melee resolution
 */
export function generateResolveMeleeEvent(state: GameState): ResolveMeleeEvent {
  const meleeState = getMeleeResolutionReadyForAttackCalculation(state);
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
  // Commitments are named for the order they were made in, first player
  // first, so each side's own commitment is found by asking who is first.
  const whiteIsFirst = hasInitiative(state, 'white');
  const whiteCommitmentModifiers = modifiersFromCompletedCommitment(
    whiteIsFirst
      ? meleeState.firstPlayerCommitment
      : meleeState.secondPlayerCommitment,
  );

  // The unit's Attack is summed raw: the attack value adds support to it
  // and is floored once, as a whole, when it lands (§7.1.4).
  const whiteAttackValue = getRawUnitStat(
    whiteUnit.unit,
    'attack',
    state,
    whiteCommitmentModifiers,
  );

  const whiteSupportValue = getMeleeSupportValue(state.boardState, whiteUnit);

  const totalWhiteAttackValue = whiteAttackValue + whiteSupportValue;

  const blackCommitmentModifiers = modifiersFromCompletedCommitment(
    whiteIsFirst
      ? meleeState.secondPlayerCommitment
      : meleeState.firstPlayerCommitment,
  );

  const blackAttackValue = getRawUnitStat(
    blackUnit.unit,
    'attack',
    state,
    blackCommitmentModifiers,
  );

  const blackSupportValue = getMeleeSupportValue(state.boardState, blackUnit);

  const totalBlackAttackValue = blackAttackValue + blackSupportValue;

  // Each side's blow is measured against the other unit's thresholds. A
  // Defence card committed by a side raises its own unit's thresholds for
  // this fight (§8.5); the rest of its card does nothing to the enemy's blow.
  // White unit attacks black unit
  const blackUnitResult = applyAttackValue(
    state,
    totalWhiteAttackValue,
    blackUnit.unit,
    blackCommitmentModifiers,
  );

  // Black unit attacks white unit
  const whiteUnitResult = applyAttackValue(
    state,
    totalBlackAttackValue,
    whiteUnit.unit,
    whiteCommitmentModifiers,
  );

  // Legal retreat hexes are computed when the retreat opens, not on this event.
  return {
    blackUnitRetreated: blackUnitResult.unitRetreated,
    blackUnitReversed: blackUnitResult.unitReversed,
    blackUnitRouted: blackUnitResult.unitRouted,
    blackUnitWithPlacement: blackUnit,
    effectType: RESOLVE_MELEE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    location: meleeCoordinate,
    whiteUnitRetreated: whiteUnitResult.unitRetreated,
    whiteUnitReversed: whiteUnitResult.unitReversed,
    whiteUnitRouted: whiteUnitResult.unitRouted,
    whiteUnitWithPlacement: whiteUnit,
  };
}
